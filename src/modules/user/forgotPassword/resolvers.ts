import * as yup from "yup";

import { ResolverMap } from "../../../types/graphql-utils";
import User from "../../../models/User";
import { expiredKeyError } from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      __
    ) => {
      const user = await User.query()
        .where({ email })
        .first();
      if (!user) {
        return false;
      }
      await User.createForgotPasswordLink(user.id);
      // @todo send email with link

      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      __
    ) => {
      const userId = await User.extractUserIdFromForgotPassKey(key);
      if (!userId) {
        return [{ path: "key", message: expiredKeyError }];
      }

      // check that new password is valid
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      await Promise.all([
        User.query()
          .update({
            password: newPassword
          })
          .where({ id: userId }),
        User.deleteForgotPassKey(key)
      ]);

      return null;
    }
  }
};
