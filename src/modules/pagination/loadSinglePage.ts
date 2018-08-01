import { redis } from "../../redis";
import db from "../../knex";
import decodeDeterministicCacheId from "./decodeDeterministicCacheId";

export default async (key: string) => {
  // it would be easy to cache with redis here...
  // attempt to load key from redis
  const cachedDataRaw = await redis.get(key);
  let data;
  if (cachedDataRaw) {
    data = JSON.parse(cachedDataRaw);
    data.pageInfo.fromCache = true;
  } else {
    // if not present, continue below to load from db
    const fetchPayload = decodeDeterministicCacheId(key);
    // now use example of voter search filter, pagination etc.
    // let query = db.table(fetchPayload.table.name);
    // query = filterQuery(query, fetchPayload.where);

    // data = await paginator(
    //   db,
    //   query,
    //   fetchPayload.orderBy,
    //   fetchPayload.limit,
    //   fetchPayload.after,
    //   fetchPayload.table.uniqueColumn
    // );
    // // after db load, store in redis. fetchPayload would need TTL value
    // if (fetchPayload.ttl) {
    //   await this.redisDb.set(key, JSON.stringify(data), "EX", fetchPayload.ttl);
    // }
    // data.pageInfo.fromCache = false;
  }
  return data;
};
