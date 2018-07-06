import { redis } from "../redis";
import { TokenPayload } from "../types/graphql-utils";
import * as jwt from "jsonwebtoken";
import { userTokenVersionPrefix } from "../constants";
import { Redis } from "ioredis";

export const parseToken = (
  token: string,
  secret: string
): TokenPayload | {} => {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return {};
  }
};

export const extractTokenFromHeaderValue = (
  authHeaderValue: string
): string => {
  if (!authHeaderValue) {
    return "";
  }
  return authHeaderValue.split(" ")[1];
};

export const validateTokenVersion = async (
  decoded: TokenPayload | {},
  iredis: Redis
) => {
  if (decoded === {}) {
    return {};
  }
  const tokenVersion = await iredis.get(
    `${userTokenVersionPrefix}${(decoded as TokenPayload).id}`
  );
  return parseInt(tokenVersion, 10) === (decoded as TokenPayload).version
    ? decoded
    : {};
};

export default async (req: any, _: any, next: any) => {
  try {
    const token = extractTokenFromHeaderValue(req.headers.authorization);
    const decoded = parseToken(token, process.env.JWT_SECRET as string);
    req.user = await validateTokenVersion(decoded, redis);
    next();
    return;
  } catch {
    req.user = {};
    next();
    return;
  }
};
