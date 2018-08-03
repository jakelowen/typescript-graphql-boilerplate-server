import * as base64 from "base-64";
import * as stringify from "json-stable-stringify";

export interface PaginationArgs {
  table: {
    name: string;
    uniqueColumn: string;
  };
  where?: any;
  orderBy?: any;
  limit?: number;
  after?: any;
  ttl?: number;
}

export default (args: PaginationArgs) => base64.encode(stringify(args));
