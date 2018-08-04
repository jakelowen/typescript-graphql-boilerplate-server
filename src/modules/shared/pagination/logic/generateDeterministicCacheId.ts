import * as base64 from "base-64";
import * as stringify from "json-stable-stringify";

export interface PaginationArgs {
  table: {
    name: string;
    uniqueColumn: string;
  };
  where?: any;
  orderBy?: any;
  limit?: number | undefined | null;
  after?: any;
  ttl?: number | undefined | null;
  noCache?: boolean | null | undefined;
}

export default (args: PaginationArgs) => base64.encode(stringify(args));
