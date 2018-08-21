import { Context } from "../../../../types/graphql-utils";

import { noUserError } from "../../changePassword/errorMessages";
import updateProfile from "../connectors/updateProfile";

export default async (
  { firstName, lastName }: GQL.IUpdateProfileInput,
  { user, dataloaders }: Context
) => {
  if (!user.id) {
    return {
      error: [{ path: "updateProfile", message: noUserError }],
      changePassword: false
    };
  }
  const updateData: UpdateData = {};

  if (firstName) {
    updateData.firstName = firstName;
  }

  if (lastName) {
    updateData.lastName = lastName;
  }

  const updatedUserDbOp = await updateProfile(user.id, updateData);

  if (updatedUserDbOp.length > 0) {
    const updatedUser = updatedUserDbOp[0];
    await dataloaders.userByEmail
      .clear(updatedUser.email)
      .prime(updatedUser.email, updatedUser);

    const changedUser = await dataloaders.userById
      .clear(updatedUser.id)
      .prime(updatedUser.id, updatedUser)
      .load(updatedUser.id);

    return { error: null, updateProfile: changedUser };
  }

  return {
    error: [{ path: "updateProfile", message: noUserError }],
    updateProfile: false
  };
};
