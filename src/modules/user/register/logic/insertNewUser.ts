import insertNewUser from "../../../../connectors/insertNewUser";
import { DataLoaders } from "../../../../types/graphql-utils";

export default async (
  email: string,
  hashedPassword: string,
  dataloaders: DataLoaders
) => {
  const newUser = await insertNewUser({ email, password: hashedPassword });

  await dataloaders.userByEmail
    .clear(newUser.email)
    .prime(newUser.email, newUser);

  await dataloaders.userById.clear(newUser.id).prime(newUser.id, newUser);

  return true;
};
