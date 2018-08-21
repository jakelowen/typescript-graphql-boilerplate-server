import updatePassword from "../../shared/connectors/updatePassword";
import { Context } from "../../../../types/graphql-utils";
import verifyPassword from "../../shared/logic/verifyPassword";
import newPasswordSchema from "../../shared/yupSchemas/newPassword";
import { formatYupError } from "../../../../utils/formatYupError";
import hashPassword from "../../shared/logic/hashPassword";
import { badPassError, noUserError } from "../errorMessages";

export default async (
  { currentPassword, newPassword }: GQL.IChangePasswordInput,
  { user, dataloaders }: Context
) => {
  if (!user.id) {
    return {
      error: [
        {
          path: "changePassword",
          message: noUserError
        }
      ],
      changePassword: false
    };
  }

  const existingUser = await dataloaders.userById.load(user.id);

  if (!existingUser) {
    return {
      error: [
        {
          path: "changePassword",
          message: badPassError
        }
      ],
      changePassword: false
    };
  }

  const passwordsMatch = await verifyPassword(
    existingUser.password,
    currentPassword
  );
  if (!passwordsMatch) {
    return {
      error: [
        {
          path: "changePassword",
          message: badPassError
        }
      ],
      changePassword: false
    };
  }

  // check that new password is valid
  try {
    await newPasswordSchema.validate({ newPassword }, { abortEarly: false });
  } catch (err) {
    return { error: formatYupError(err), forgotPasswordChange: false };
  }

  const hashedPassword = await hashPassword(newPassword);

  await updatePassword(hashedPassword, user.id);
  return { changePassword: true, error: null };
};
