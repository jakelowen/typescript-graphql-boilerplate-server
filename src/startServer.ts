// @TODO - SECURE WEBSOCKET CONNECTION

import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import { RedisPubSub } from "graphql-redis-subscriptions";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as RateLimit from "express-rate-limit";
import * as Redis from "ioredis";

import { redis } from "./redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
import { redisSessionPrefix, redisSessionKeyTTL } from "./constants";
import { createTestConn } from "./testUtils/createTestConn";
import { Session } from "./types/graphql-utils";

const pubsub = new RedisPubSub({
  publisher: new Redis(),
  subscriber: new Redis()
});

// redis store for sessions
const RedisStore = connectRedis(session);

// pull out sessionParser for use in both queries and subscriptions
const sessionParser = session({
  store: new RedisStore({
    client: redis as any,
    prefix: redisSessionPrefix
  }),
  name: "qid",
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: redisSessionKeyTTL
  }
});

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request, connection }) => {
      // return a special context in case of subscription
      if (connection && !request) {
        return {
          redis,
          session: connection.context.session,
          pubsub
        };
      }
      // else return the normal conext
      return {
        redis,
        url: request.protocol + "://" + request.get("host"),
        session: request.session,
        req: request,
        pubsub
      };
      // }
    }
  });

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

  server.express.use(sessionParser);

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === "test"
        ? "*"
        : (process.env.FRONTEND_HOST as string)
  };

  server.express.get("/confirm/:id", confirmEmail);

  if (process.env.NODE_ENV === "test") {
    await createTestConn(true);
  } else {
    await createTypeormConn();
  }

  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000,
    subscriptions: {
      path: "/",
      onConnect: async (_: any, webSocket: any) => {
        const wsSession = await new Promise<Session>(resolve => {
          // use same session parser as normal gql queries
          sessionParser(webSocket.upgradeReq, {} as any, () => {
            if (webSocket.upgradeReq.session) {
              resolve(webSocket.upgradeReq.session);
            }
            return false;
          });
        });
        // We have a good session. attach to context
        if (wsSession.userId) {
          return { session: wsSession };
        }
        // throwing error rejects the connection
        throw new Error("Missing auth token!");
      }
    }
  });
  console.log("Server is running on localhost:4000");

  return app;
};
