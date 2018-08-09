import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import { RedisPubSub } from "graphql-redis-subscriptions";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as RateLimit from "express-rate-limit";
import * as Redis from "ioredis";
import * as depthLimit from "graphql-depth-limit";

import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
import dataloaders from "./modules/shared/dataloaders";
import customJWTmiddleware, {
  parseToken,
  validateTokenVersion
} from "./utils/customJWTmiddleware";
import { AssertionError } from "assert";

const pubsub = new RedisPubSub({
  publisher:
    process.env.NODE_ENV === "production"
      ? new Redis(process.env.REDIS_URL)
      : new Redis(),
  subscriber:
    process.env.NODE_ENV === "production"
      ? new Redis(process.env.REDIS_URL)
      : new Redis()
});

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request, connection }: { request: any; connection: any }) => {
      // return a special context in case of subscription
      if (connection && !request) {
        return {
          redis,
          user: connection.context.user,
          pubsub,
          dataloaders: dataloaders()
        };
      }
      // else return the normal conext
      // console.log(request);
      return {
        redis,
        url: request.protocol + "://" + request.get("host"), // session: request.session,
        user: request.user,
        req: request,
        pubsub,
        dataloaders: dataloaders()
      };
      // }
    },
    validationRules: [depthLimit(10)]
  } as any);

  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 100, // limit each ip to 100 requests per windowMs
      delayMs: 0 // disable delaying - full speed until max limit is reached
    })
  );

  server.express.use(customJWTmiddleware);

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };

  server.express.get("/confirm/:id", confirmEmail);

  const port = process.env.PORT || 4000;
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : port,
    subscriptions: {
      path: "/",
      onConnect: async (connectionParams: any) => {
        const token = connectionParams.token;
        if (!token) {
          throw new AssertionError({ message: "NO TOKEN PRESENT" });
        }
        const decoded = parseToken(token, process.env.JWT_SECRET as string);
        const user = await validateTokenVersion(decoded, redis);
        if (user === {}) {
          throw new AssertionError({ message: "NO VALID USER" });
        }
        return { user };
      }
    }
  });
  console.log(`Server is running on localhost:${port}`);

  return app;
};
