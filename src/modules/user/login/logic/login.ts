import { Context } from "../../../../types/graphql-utils";
import { errorResponse, confirmEmailError } from "../errorMessages";
import verifyPassword from "../../shared/logic/verifyPassword";
import getCurrentValidTokenVersion from "./getCurrentValidTokenVersion";
import generateToken from "./generateToken";

export default async (
  { email, password }: GQL.ILoginInput,
  { redis, dataloaders }: Context
) => {
  const existingUser = await dataloaders.userByEmail.load(email);

  if (!existingUser) {
    return { error: errorResponse };
  }

  if (!existingUser.confirmed) {
    return { error: [{ path: "email", message: confirmEmailError }] };
  }

  if (!(await verifyPassword(existingUser.password, password))) {
    return { error: errorResponse };
  }

  // passes all checks, proceed with login
  const currentValidTokenVersion = await getCurrentValidTokenVersion(
    existingUser.id,
    redis
  );

  const loginToken = generateToken(existingUser.id, currentValidTokenVersion);

  return { login: loginToken };
};
