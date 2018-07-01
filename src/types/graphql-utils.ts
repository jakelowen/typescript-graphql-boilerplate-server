import { Redis } from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";

export interface TokenPayload {
  id: string;
  version: number;
  iat: number;
  exp: number;
}

export interface Session extends Express.Session {
  userId?: string;
}

export interface Context {
  redis: Redis;
  url: string;
  session: Session;
  user: {
    id: string;
  };
  req: Express.Request;
  pubsub: RedisPubSub;
}

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

export type GraphqlMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any;

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver;
  };
}
