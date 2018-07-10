import { ResolverMap } from "../../../types/graphql-utils";
import { errorResponse, confirmEmailError } from "./errorMessages";
import verifyPassword from "./logic/verifyPassword";
import getCurrentValidTokenVersion from "./logic/getCurrentValidTokenVersion";
import generateToken from "./logic/generateToken";

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { redis, dataloaders }
    ) => {
      const existingUser = await dataloaders.userByEmail.load(email);

      if (!existingUser) {
        return { error: errorResponse };
      }

      if (!existingUser.confirmed) {
        return { error: [{ path: "email", message: confirmEmailError }] };
      }

      if (!(await verifyPassword(existingUser.password, password))) {
        return { error: errorResponse };
      }

      // passes all checks, proceed with login
      const currentValidTokenVersion = await getCurrentValidTokenVersion(
        existingUser.id,
        redis
      );

      const loginToken = generateToken(
        existingUser.id,
        currentValidTokenVersion
      );

      return { login: loginToken };
    }
  }
};
