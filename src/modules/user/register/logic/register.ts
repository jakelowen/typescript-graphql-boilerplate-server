import { Context } from "../../../../types/graphql-utils";
import registrationYupSchema from "../yupSchemas/registrationSchema";
import { formatYupError } from "../../../../utils/formatYupError";
import { duplicateEmail } from "../errorMessages";
import hashPassword from "../../shared/logic/hashPassword";
import insertNewUser from "./insertNewUser";

export default async (
  { email, password }: GQL.IRegisterInput,
  { dataloaders }: Context
) => {
  // make sure input matches validation
  try {
    await registrationYupSchema.validate(
      { email, password },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: formatYupError(err) };
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
  await insertNewUser(email, hashedPassword, dataloaders);
  return { register: null, error: null };
};
