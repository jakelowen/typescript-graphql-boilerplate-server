import { ResolverMap } from "../../../types/graphql-utils";
import me from "./logic/me";

export const resolvers: ResolverMap = {
  Query: {
    async me(_, __, ctx) {
      return me(ctx);
    }
  }
};
