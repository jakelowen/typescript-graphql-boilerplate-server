import * as yup from "yup";

import { registerPasswordValidation } from "../../../yupSchemas";
import { ResolverMap } from "../../../types/graphql-utils";
import { formatYupError } from "../../../utils/formatYupError";
import insertNewUser from "./logic/insertNewUser";
import {
  emailNotLongEnough,
  invalidEmail,
  duplicateEmail
} from "./errorMessages";
import hashPassword from "../shared/logic/hashPassword";

export const registrationYupSchema = yup.object().shape({
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
      args: GQL.IRegisterOnMutationArguments,
      { dataloaders }
    ) => {
      // make sure input matches validation
      try {
        await registrationYupSchema.validate(args, { abortEarly: false });
      } catch (err) {
        return { error: formatYupError(err) };
      }

      // see if user already in db with this email
      const { email, password } = args;
      const existingUser = await dataloaders.userByEmail.load(email);

      if (existingUser) {
        return {
          error: [{ path: "email", message: duplicateEmail }]
        };
      }

      // proceed with registration
      const hashedPassword = await hashPassword(password);
      await insertNewUser(email, hashedPassword, dataloaders);
      return { register: null, error: null };
    }
  }
};
