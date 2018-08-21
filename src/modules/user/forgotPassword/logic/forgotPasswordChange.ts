import { Context } from "../../../../types/graphql-utils";
import extractUserIdFromForgotPassKey from "./extractUserIdFromForgotPassKey";
import { expiredKeyError } from "../errorMessages";
import newPasswordSchema from "../../shared/yupSchemas/newPassword";
import { formatYupError } from "../../../../utils/formatYupError";
import hashPassword from "../../shared/logic/hashPassword";
import updatePassword from "../../shared/connectors/updatePassword";
import deleteForgotPassKey from "./deleteForgotPassKey";

export default async (
  { newPassword, key }: GQL.IForgotPasswordChangeInput,
  { redis }: Context
) => {
  const userId = await extractUserIdFromForgotPassKey(key, redis);

  if (!userId) {
    return {
      error: [{ path: "key", message: expiredKeyError }],
      forgotPasswordChange: false
    };
  }
  // check that new password is valid
  try {
    await newPasswordSchema.validate({ newPassword }, { abortEarly: false });
  } catch (err) {
    return { error: formatYupError(err), forgotPasswordChange: false };
  }

  const hashedPassword = await hashPassword(newPassword);
  await Promise.all([
    updatePassword(hashedPassword, userId),
    deleteForgotPassKey(key, redis)
  ]);

  return { forgotPasswordChange: true, error: null };
};
