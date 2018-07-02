// @TODO - SECURE WEBSOCKET CONNECTION

import "reflect-metadata";
import "dotenv/config";
import { GraphQLServer } from "graphql-yoga";
import { RedisPubSub } from "graphql-redis-subscriptions";
// import * as session from "express-session";
// import * as connectRedis from "connect-redis";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as RateLimit from "express-rate-limit";
import * as Redis from "ioredis";

import { redis } from "./redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/generateSchema";
// import { redisSessionPrefix, redisSessionKeyTTL } from "./constants";
import { createTestConn } from "./testUtils/createTestConn";
import * as jwt from "jsonwebtoken";
import { TokenPayload } from "./types/graphql-utils";
import { userTokenVersionPrefix } from "./constants";
// import { Session } from "./types/graphql-utils";

const pubsub = new RedisPubSub({
  publisher: new Redis(),
  subscriber: new Redis()
});

// redis store for sessions
// const RedisStore = connectRedis(session);

// auth middleware
// const auth = jwt({
//   secret: process.env.JWT_SECRET as string,
//   credentialsRequired: false
// });

// pull out sessionParser for use in both queries and subscriptions
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
          session: connection.context.session,
          pubsub
        };
      }
      // else return the normal conext
      // console.log(request);
      return {
        redis,
        url: request.protocol + "://" + request.get("host"),
        // session: request.session,
        user: request.user,
        req: request,
        pubsub
      };
      // }
    }
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

  // server.express.use(
  //   session({
  //     store: new RedisStore({
  //       client: redis as any,
  //       prefix: redisSessionPrefix
  //     }),
  //     name: "qid",
  //     secret: process.env.SESSION_SECRET as string,
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       maxAge: redisSessionKeyTTL
  //     }
  //   })
  // );

  server.express.use(async (req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = {};
      next();
      return;
    }
    try {
      const decoded = jwt.verify((authHeader as string).split(" ")[1], process
        .env.JWT_SECRET as string) as TokenPayload;
      // get the user token version based on id
      const tokenVersion = await redis.get(
        `${userTokenVersionPrefix}${decoded.id}`
      );
      // if version match attach user
      // if version not match, ignore.
      req.user = decoded.version === parseInt(tokenVersion, 10) ? decoded : {};
      next();
      return;
    } catch {
      req.user = {};
      next();
      return;
    }
  });

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
      onConnect: async () => {
        // console.log("CP!!!!", connectionParams);
        // if (!connectionParams.subscriptionToken) {
        //   throw new Error("Missing subscription auth token!");
        // }
        // const userId = await redis.get(``);
        // const wsSession = await new Promise<Session>(resolve => {
        //   console.log("CP!!!!", connectionParams);
        //   // use same session parser as normal gql queries
        //   // sessionParser(webSocket.upgradeReq, {} as any, () => {
        //   //   if (webSocket.upgradeReq.session) {
        //   //     resolve(webSocket.upgradeReq.session);
        //   //   }
        //   //   return false;
        //   // });
        // });
        // We have a good session. attach to context
        // if (wsSession.userId) {
        //   return { session: wsSession };
        // }
        // throwing error rejects the connection
        // return true;
      }
    }
  });
  console.log("Server is running on localhost:4000");

  return app;
};
