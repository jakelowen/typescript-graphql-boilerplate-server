import * as DataLoader from "dataloader";
import { map } from "lodash";
// import { decodeDeterministicCacheId } from '../utils';
// import { filterQuery } from '../db/filterQuery';
// import { paginator } from '../db/paginator';

// class PotentialVotersConnector {
//   // constructor({ sqlDb, redisDb }) {
//   //   this.sqlDb = sqlDb;
//   //   this.redisDb = redisDb;
//   // }

//   pageLoader = new DataLoader(keys => this.batchLoadPages(keys));

//   loadSinglePage = async key => {
//     // it would be easy to cache with redis here...
//     // attempt to load key from redis
//     const cachedDataRaw = await this.redisDb.get(key);
//     let data;
//     if (cachedDataRaw) {
//       data = JSON.parse(cachedDataRaw);
//       data.pageInfo.fromCache = true;
//     } else {
//       // if not present, continue below to load from db
//       const fetchPayload = decodeDeterministicCacheId(key);
//       // now use example of voter search filter, pagination etc.
//       let query = this.sqlDb.table(fetchPayload.table.name);
//       query = filterQuery(query, fetchPayload.where);

//       data = await paginator(
//         this.sqlDb,
//         query,
//         fetchPayload.orderBy,
//         fetchPayload.limit,
//         fetchPayload.after,
//         fetchPayload.table.uniqueColumn
//       );
//       // after db load, store in redis. fetchPayload would need TTL value
//       if (fetchPayload.ttl) {
//         await this.redisDb.set(key, JSON.stringify(data), 'EX', fetchPayload.ttl);
//       }
//       data.pageInfo.fromCache = false;
//     }
//     return data;
//   };

//   batchLoadPages = keys => Promise.resolve(map(keys, key => this.loadSinglePage(key)));
// }

// export default PotentialVotersConnector;
