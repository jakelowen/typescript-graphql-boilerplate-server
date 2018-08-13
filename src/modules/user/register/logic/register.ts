import { Context } from "../../../../types/graphql-utils";
import registrationYupSchema from "../yupSchemas/registrationSchema";
import { formatYupError } from "../../../../utils/formatYupError";
import { duplicateEmail } from "../errorMessages";
import hashPassword from "../../shared/logic/hashPassword";
import insertNewUser from "./insertNewUser";
import createConfirmEmailLink from "./createConfirmEmailLink";
import { redis } from "../../../../redis";
import subject from "../../../../email/templates/confirmEmail/subject";
import html from "../../../../email/templates/confirmEmail/html";
import text from "../../../../email/templates/confirmEmail/text";
import sendEmail from "../../../../email/connectors/sendEmail";

export default async (
  { email, password, firstName, lastName }: GQL.IRegisterInput,
  { dataloaders }: Context
) => {
  // make sure input matches validation
  try {
    await registrationYupSchema.validate(
      { email, password, firstName, lastName },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: formatYupError(err) };
  }

  if (!firstName) {
    firstName = null;
  }

  if (!lastName) {
    lastName = null;
  }

  // see if user already in db with this email
  const existingUser = await dataloaders.userByEmail.load(email);

  if (existingUser) {
    return {
      error: [{ path: "email", message: duplicateEmail }]
    };
  }

  // proceed with registration
  const hashedPassword = await hashPassword(password);
  const newUser = await insertNewUser(
    email,
    firstName,
    lastName,
    hashedPassword,
    dataloaders
  );

  // send confirm email message
  const url = await createConfirmEmailLink(
    process.env.SERVER_HOST as string,
    newUser.id,
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

  return { register: null, error: null };
};
