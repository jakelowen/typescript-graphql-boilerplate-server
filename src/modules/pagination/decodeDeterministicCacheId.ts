import * as base64 from "base-64";
import { PaginationArgs } from "./generateDeterministicCacheId";

export default (cacheId: string): PaginationArgs =>
  JSON.parse(base64.decode(cacheId));
