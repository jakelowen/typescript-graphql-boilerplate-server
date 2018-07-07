import * as yup from "yup";

import { ResolverMap } from "../../../types/graphql-utils";
import User from "../../../models/User";
import { formatYupError } from "../../../utils/formatYupError";
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail
} from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return { error: formatYupError(err) };
      }

      const { email, password } = args;
      const userAlreadyExists = await User.query()
        .where({ email })
        .select("id")
        .first();

      if (userAlreadyExists) {
        return {
          error: [
            {
              path: "email",
              message: duplicateEmail
            }
          ]
        };
      }

      await User.query().insert({ email, password });

      return { register: null };
    }
  }
};
