import { Context } from "../../../../types/graphql-utils";
import resendConfirmationEmailSchema from "../yupSchemas/resendConfirmationEmailSchema";
import { formatYupError } from "../../../../utils/formatYupError";
import createConfirmEmailLink from "./createConfirmEmailLink";
import { redis } from "../../../../redis";
import subject from "../../../../email/templates/confirmEmail/subject";
import html from "../../../../email/templates/confirmEmail/html";
import text from "../../../../email/templates/confirmEmail/text";
import sendEmail from "../../../../email/connectors/sendEmail";

export default async (
  { email }: GQL.IResendConfirmationEmailInput,
  { dataloaders }: Context
) => {
  try {
    await resendConfirmationEmailSchema.validate(
      { email },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: formatYupError(err), resendConfirmationEmail: false };
  }

  // see if user already in db with this email
  const existingUser = await dataloaders.userByEmail.load(email);

  if (!existingUser) {
    // if no user exists, immediately return true
    // we don't want to expose if email addy exists or not.
    return { resendConfirmationEmail: true, error: null };
  }

  // send confirm email message
  const url = await createConfirmEmailLink(
    process.env.SERVER_HOST as string,
    existingUser.id,
    redis
  );

  // @todo send email with link
  const messageData = {
    from: process.env.EMAIL_SENDER as string,
    to: email,
    subject: subject(),
    html: html(url),
    txt: text(url)
  };
  await sendEmail(messageData);

  return { resendConfirmationEmail: true, error: null };
};
