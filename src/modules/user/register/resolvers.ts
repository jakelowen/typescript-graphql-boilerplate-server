import { ResolverMap } from "../../../types/graphql-utils";
import register from "./logic/register";
import resendConfirmationEmail from "./logic/resendConfirmationEmail";

export const resolvers: ResolverMap = {
  Mutation: {
    async register(_, args, ctx) {
      return register(args.input, ctx);
    },
    async resendConfirmationEmail(_, args, ctx) {
      return resendConfirmationEmail(args.input, ctx);
    }
  }
};
