import { ResolverMap } from "../../types/graphql-utils";
import loadTeams from "./logic/loadTeams";
import loadTeam from "./logic/loadTeam";

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
    async team(_, args, ctx) {
      return { team: await loadTeam(args, ctx) };
    },
    async teams(_, args, ctx) {
      return loadTeams(args, ctx);
    }
  }
};
