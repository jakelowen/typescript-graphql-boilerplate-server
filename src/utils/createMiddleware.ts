import { Resolver, GraphqlMiddlewareFunc } from "../types/graphql-utils";

export const createMiddleware = (
  middlewareFunc: GraphqlMiddlewareFunc,
  resolverFunc: Resolver
) => (parent: any, args: any, context: any, info: any) =>
  middlewareFunc(resolverFunc, parent, args, context, info);
