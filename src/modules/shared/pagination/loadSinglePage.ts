import { redis } from "../../../redis";
import db from "../../../knex";
import decodeDeterministicCacheId from "./decodeDeterministicCacheId";
import { filterQuery } from "./filterQuery";
import { paginator } from "./paginator";

export default async (key: string) => {
  // attempt to load key from redis
  const fetchPayload = decodeDeterministicCacheId(key);
  let data;
  // skip cache check if ttl is 0
  const cachedDataRaw =
    !fetchPayload.ttl || fetchPayload.ttl === 0
      ? undefined
      : await redis.get(key);

  if (cachedDataRaw) {
    data = JSON.parse(cachedDataRaw);
    data.pageInfo.fromCache = true;
  } else {
    // if not present, continue below to load from db
    // now use example of voter search filter, pagination etc.
    let query = db.table(fetchPayload.table.name);
    query = filterQuery(query, fetchPayload.where);
    data = await paginator(
      query,
      fetchPayload.orderBy,
      fetchPayload.limit,
      fetchPayload.after,
      fetchPayload.table.uniqueColumn
    );
    // after db load, store in redis. fetchPayload would need TTL value
    if (fetchPayload.ttl && fetchPayload.ttl > 0) {
      await redis.set(key, JSON.stringify(data), "EX", fetchPayload.ttl);
    }
    data.pageInfo.fromCache = false;
  }
  return data;
};
