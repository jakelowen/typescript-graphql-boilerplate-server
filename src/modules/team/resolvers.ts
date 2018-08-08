import { ResolverMap } from "../../types/graphql-utils";
import loadTeams from "./logic/loadTeams";
import loadTeam from "./logic/loadTeam";
import createTeam from "./logic/createTeam";
import updateTeam from "./logic/updateTeam";
import deleteTeam from "./logic/deleteTeam";
import getTeamUsers from "./logic/getTeamUsers";

export const resolvers: ResolverMap = {
  Mutation: {
    createTeam(_, args, ctx) {
      return createTeam(args.input, ctx);
    },
    updateTeam(_, args, ctx) {
      return updateTeam(args.input, ctx);
    },
    deleteTeam(_, args, ctx) {
      return deleteTeam(args.input, ctx);
    }
  },
  Query: {
    async team(_, args, ctx) {
      return { team: await loadTeam(args, ctx) };
    },
    async teams(_, args, ctx) {
      return loadTeams(args, ctx);
    }
  },
  Team: {
    async users(team, _, ctx) {
      return getTeamUsers(team.id, ctx);
    }
  }
};
