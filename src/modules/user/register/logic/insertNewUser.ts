import insertNewUser from "../../shared/connectors/insertNewUser";
import { DataLoaders } from "../../../../types/graphql-utils";

export default async (
  email: string,
  firstName: string | null,
  lastName: string | null,
  hashedPassword: string,
  dataloaders: DataLoaders
) => {
  const newUserOp = await insertNewUser({
    email,
    firstName,
    lastName,
    password: hashedPassword
  });
  const newUser = newUserOp[0];

  await dataloaders.userByEmail
    .clear(newUser.email)
    .prime(newUser.email, newUser);

  return dataloaders.userById
    .clear(newUser.id)
    .prime(newUser.id, newUser)
    .load(newUser.id);
};
