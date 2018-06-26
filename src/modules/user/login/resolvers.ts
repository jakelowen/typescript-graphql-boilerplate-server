import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { userSessionIdPrefix, redisSessionKeyTTL } from "../../../constants";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin
  }
];

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [{ path: "email", message: confirmEmailError }];
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID) {
        await redis
          .multi()
          .lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
          .expire(`${userSessionIdPrefix}${user.id}`, redisSessionKeyTTL)
          .exec();
      }

      return null;
    }
  }
};
