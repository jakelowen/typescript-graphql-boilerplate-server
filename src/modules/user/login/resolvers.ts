import User from "../../../models/User";
import { ResolverMap } from "../../../types/graphql-utils";
import { invalidLogin, confirmEmailError } from "./errorMessages";

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
      __
    ) => {
      const existingUser = await User.query()
        .where({ email })
        .first();
      if (!existingUser) {
        return { error: errorResponse };
      }

      if (!existingUser.confirmed) {
        return { error: [{ path: "email", message: confirmEmailError }] };
      }

      if (!(await existingUser.verifyPassword(password))) {
        return { error: errorResponse };
      }

      return { login: existingUser.loginToken };
    }
  }
};
