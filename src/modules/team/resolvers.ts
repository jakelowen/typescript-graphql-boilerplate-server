import { ResolverMap } from "../../types/graphql-utils";
import loadTeams from "./logic/loadTeams";

export const resolvers: ResolverMap = {
  Mutation: {
    createTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    updateTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    deleteTeam(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    }
  },
  Query: {
    team(root, args, ctx) {
      console.log(root, args, ctx);
      return null;
    },
    async teams(_, args, ctx) {
      return loadTeams(args, ctx);
    }
  }
};
