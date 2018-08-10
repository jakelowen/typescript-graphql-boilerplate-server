import createForgotPasswordLink from "./createForgotPasswordLink";
import { Context } from "../../../../types/graphql-utils";
import sendEmail from "../../../../email/connectors/sendEmail";
import subject from "../../../../email/templates/forgotPassword/subject";
import html from "../../../../email/templates/forgotPassword/html";
import text from "../../../../email/templates/forgotPassword/text";

export default async (
  { email }: GQL.ISendForgotPasswordEmailInput,
  { redis, dataloaders }: Context
) => {
  const existingUser = await dataloaders.userByEmail.load(email);

  if (!existingUser) {
    return false;
  }

  const url = await createForgotPasswordLink(existingUser.id, redis);
  // @todo send email with link
  const messageData = {
    from: process.env.EMAIL_SENDER as string,
    to: email,
    subject: subject(),
    html: html(url),
    txt: text(url)
  };
  await sendEmail(messageData);

  return { sendForgotPasswordEmail: true };
};
