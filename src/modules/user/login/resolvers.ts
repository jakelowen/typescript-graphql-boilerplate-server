import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import * as jwt from "jsonwebtoken";
import { userTokenVersionPrefix } from "../../../constants";
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
      { redis }
    ) => {
      const userDb = await User.findOne({ where: { email } });

      if (!userDb) {
        return { error: errorResponse };
      }

      if (!userDb.confirmed) {
        return { error: [{ path: "email", message: confirmEmailError }] };
      }

      const valid = await bcrypt.compare(password, userDb.password);

      if (!valid) {
        return {
          error: errorResponse
        };
      }

      // get counter for userid.
      let tokenVersion = await redis.get(
        `${userTokenVersionPrefix}${userDb.id}`
      );

      if (!tokenVersion) {
        await redis.set(`${userTokenVersionPrefix}${userDb.id}`, 1);
        tokenVersion = "1";
      }

      // token
      const token = jwt.sign(
        { id: userDb.id, version: tokenVersion },
        process.env.JWT_SECRET as any,
        { expiresIn: "24h" }
      );

      return { login: token };
    }
  }
};
