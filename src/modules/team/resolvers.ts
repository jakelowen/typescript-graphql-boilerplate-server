import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    me: () => "team"
  }
};

// async ({ where, orderBy, limit, after }, ctx) => {
//   const fetchPayload = {
//     table: {
//       name: 'organizations',
//       uniqueColumn: 'id',
//     },
//     where,
//     orderBy,
//     limit,
//     after,
//     ttl: 120,
//   };

//   return await ctx.connectors.page.pageLoader.load(generateDeterministicCacheId(fetchPayload));
