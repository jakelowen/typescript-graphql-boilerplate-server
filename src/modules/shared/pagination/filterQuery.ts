import { map } from "lodash";
import * as Knex from "knex";

// heavy inspiration from https://gist.github.com/gc-codesnippets/f302c104f2806f9e13f41d909e07d82d
// 14 basic ops are
// _is
// _not
// _in
// _notin
// _lt
// _lte
// _gt
// _gte
// _contains
// _notcontains
// _startswith
// _notstartswith
// _endswith
// _notendswith
// AND
// OR

export const filterQuery = (
  query: Knex.QueryBuilder,
  where: any,
  or?: boolean
) => {
  if (!where) {
    return query;
  }

  map(where, (value, key) => {
    // _is
    if (key.endsWith("_is")) {
      const field = key.replace("_is", "");
      if (!or) {
        query.where(field, value);
      } else {
        query.orWhere(field, value);
      }
    }

    // _not
    if (key.endsWith("_not")) {
      const field = key.replace("_not", "");
      if (!or) {
        query.where(field, "!=", value);
      } else {
        query.orWhere(field, "!=", value);
      }
    }

    // _in: [String!]
    if (key.endsWith("_in")) {
      const field = key.replace("_in", "");
      if (!or) {
        query.whereIn(field, value);
      } else {
        query.orWhereIn(field, value);
      }
    }

    // _not_in: [String!]
    if (key.endsWith("_notin")) {
      const field = key.replace("_notin", "");
      if (!or) {
        query.whereNotIn(field, value);
      } else {
        query.orWhereNotIn(field, value);
      }
    }

    // _lt
    if (key.endsWith("_lt")) {
      const field = key.replace("_lt", "");
      if (!or) {
        query.where(field, "<", value);
      } else {
        query.orWhere(field, "<", value);
      }
    }

    // _lte
    if (key.endsWith("_lte")) {
      const field = key.replace("_lte", "");
      if (!or) {
        query.where(field, "<=", value);
      } else {
        query.orWhere(field, "<=", value);
      }
    }

    // _gt
    if (key.endsWith("_gt")) {
      const field = key.replace("_gt", "");
      if (!or) {
        query.where(field, ">", value);
      } else {
        query.orWhere(field, ">", value);
      }
    }

    // _gte
    if (key.endsWith("_gte")) {
      const field = key.replace("_gte", "");
      if (!or) {
        query.where(field, ">=", value);
      } else {
        query.orWhere(field, ">=", value);
      }
    }

    // _contains
    if (key.endsWith("_contains")) {
      const field = key.replace("_contains", "");
      if (!or) {
        query.where(field, "ILIKE", `%${value}%`);
      } else {
        query.orWhere(field, "ILIKE", `%${value}%`);
      }
    }

    // _notcontains
    if (key.endsWith("_notcontains")) {
      const field = key.replace("_notcontains", "");
      if (!or) {
        query.where(field, "NOT ILIKE", `%${value}%`);
      } else {
        query.orWhere(field, "NOT ILIKE", `%${value}%`);
      }
    }

    // _startswith
    if (key.endsWith("_startswith")) {
      const field = key.replace("_startswith", "");
      if (!or) {
        query.where(field, "ILIKE", `${value}%`);
      } else {
        query.orWhere(field, "ILIKE", `${value}%`);
      }
    }

    // _notstartswith
    if (key.endsWith("_notstartswith")) {
      const field = key.replace("_notstartswith", "");
      if (!or) {
        query.where(field, "NOT ILIKE", `${value}%`);
      } else {
        query.orWhere(field, "NOT ILIKE", `${value}%`);
      }
    }

    // _endswith
    if (key.endsWith("_endswith")) {
      const field = key.replace("_endswith", "");
      if (!or) {
        query.where(field, "ILIKE", `%${value}`);
      } else {
        query.orWhere(field, "ILIKE", `%${value}`);
      }
    }

    // _notendswith
    if (key.endsWith("_notendswith")) {
      const field = key.replace("_notendswith", "");
      if (!or) {
        query.where(field, "NOT ILIKE", `%${value}`);
      } else {
        query.orWhere(field, "NOT ILIKE", `%${value}`);
      }
    }

    // and
    if (key === "AND") {
      map(value, op => {
        query.andWhere(function() {
          filterQuery(this, op, false);
        });
      });
    }

    // or
    if (key === "OR") {
      map(value, op => {
        query.orWhere(function() {
          filterQuery(this, op, true);
        });
      });
    }
  });
  return query;
};
