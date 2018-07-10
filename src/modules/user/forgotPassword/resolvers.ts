import * as yup from "yup";

import db from "../../../knex";
import { ResolverMap } from "../../../types/graphql-utils";
import { expiredKeyError } from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";
import createForgotPasswordLink from "./logic/createForgotPasswordLink";
import extractUserIdFromForgotPassKey from "./logic/extractUserIdFromForgotPassKey";
import deleteForgotPassKey from "./logic/deleteForgotPassKey";
import hashPassword from "../shared/logic/hashPassword";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis, dataloaders }
    ) => {
      const existingUser = await dataloaders.userByEmail.load(email);

      if (!existingUser) {
        return false;
      }

      await createForgotPasswordLink(existingUser.id, redis);
      // @todo send email with link

      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await extractUserIdFromForgotPassKey(key, redis);

      if (!userId) {
        return [{ path: "key", message: expiredKeyError }];
      }
      // check that new password is valid
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await hashPassword(newPassword);
      await Promise.all([
        db("users")
          .update({ password: hashedPassword })
          .where({ id: userId }),
        deleteForgotPassKey(key, redis)
      ]);

      return null;
    }
  }
};
