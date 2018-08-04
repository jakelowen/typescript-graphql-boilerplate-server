import * as base64 from "base-64";
import { map } from "lodash";
import db from "../../../../knex";
import * as Knex from "knex";

export const paginator = async (
  query: Knex.QueryBuilder,
  orderBy: any,
  limit: number | undefined | null,
  after: string,
  uniqueColumn: string
) => {
  // treat original query as subquery (includes filters)
  const paginationQuery = db.select().from(query.clone().as("filters"));

  orderBy = orderBy || [];
  limit = limit || 25;

  if (after) {
    const decodedCursor = JSON.parse(base64.decode(after));
    // override orderBY
    orderBy = decodedCursor.orderBy;
    // let rawCompositeColumns
    const keys = map(orderBy, "sort");
    const whereRawValues = decodedCursor.values
      .map((value: string) => `'${value}'`)
      .join(",");
    const whereRawComposite = `(${keys.join()}) >= (${whereRawValues})`;
    paginationQuery.whereRaw(whereRawComposite);
  } else {
    // if cursor is present below is automatically done.
    // also apply unique column orderBy
    orderBy.push({ sort: uniqueColumn, direction: "ASC" });
  }

  // honor request orderBy args
  if (orderBy) {
    map(orderBy, ordering => {
      paginationQuery.orderBy(ordering.sort, ordering.direction);
    });
  }

  // apply item count limit
  if (limit) {
    paginationQuery.limit(limit + 1);
  }

  // I know following works, but failed linting. next 2 blocks are attempt to break it out.
  // let [items, [countResults]] = await Promise.all([
  //   paginationQuery,
  //   query.count()
  // ]);

  const preResults = await Promise.all([paginationQuery, query.count()]);

  let items = preResults[0];
  const countResults = preResults[1][0];

  // encode cursor if necessary
  let encodedCursor;
  if (items.length > limit) {
    const values = map(
      orderBy,
      ordering => items[limit as number][ordering.sort]
    );
    // add uniqueColumn to values
    values.push(items[limit][uniqueColumn]);
    orderBy.push({ sort: uniqueColumn, direction: "ASC" });
    const cursorPayload = { orderBy, values };
    // we have a next page - make a cursor
    encodedCursor = base64.encode(JSON.stringify(cursorPayload));
    items = items.slice(0, limit);
  }

  return {
    items,
    pageInfo: {
      nextCursor: encodedCursor,
      totalCount: countResults.count,
      fromCache: false
    }
  };
};
