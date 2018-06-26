import { ResolverMap } from "../../../types/graphql-utils";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { User } from "../../../entity/User";
import { forgotPasswordPrefix } from "../../../constants";
import { expiredKeyError } from "./errorMessages";
import * as yup from "yup";
import { registerPasswordValidation } from "../../../yupSchemas";
import { formatYupError } from "../../../utils/formatYupError";
import * as bcrypt from "bcryptjs";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return false;
      }
      await createForgotPasswordLink(
        process.env.FRONTEND_HOST as string,
        user.id,
        redis
      );
      // @todo send email with link

      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);
      // check if found that key is valid
      if (!userId) {
        return [{ path: "key", message: expiredKeyError }];
      }

      // check that new password is valid
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      //  update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const userUpdatePromise = User.update(
        { id: userId },
        {
          password: hashedPassword
        }
      );

      const delRedisKeyPromise = redis.del(redisKey);

      await Promise.all([userUpdatePromise, delRedisKeyPromise]);

      return null;
    }
  }
};
