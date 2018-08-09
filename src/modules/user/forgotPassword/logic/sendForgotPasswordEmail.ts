import createForgotPasswordLink from "./createForgotPasswordLink";
import { Context } from "../../../../types/graphql-utils";

export default async (
  { email }: GQL.ISendForgotPasswordEmailInput,
  { redis, dataloaders }: Context
) => {
  const existingUser = await dataloaders.userByEmail.load(email);

  if (!existingUser) {
    return false;
  }

  await createForgotPasswordLink(existingUser.id, redis);
  // @todo send email with link

  return true;
};
