import { Context } from "../../../../types/graphql-utils";

export default ({ user, dataloaders }: Context) => {
  if (!user.id) {
    return null;
  }

  return dataloaders.userById.load(user.id);
};
