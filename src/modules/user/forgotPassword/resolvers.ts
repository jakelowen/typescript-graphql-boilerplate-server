import { ResolverMap } from "../../../types/graphql-utils";
import sendForgotPasswordEmail from "./logic/sendForgotPasswordEmail";
import forgotPasswordChange from "./logic/forgotPasswordChange";

export const resolvers: ResolverMap = {
  Mutation: {
    sendForgotPasswordEmail(_, args, ctx) {
      return sendForgotPasswordEmail(args.input, ctx);
    },
    async forgotPasswordChange(_, args, ctx) {
      return forgotPasswordChange(args.input, ctx);
    }
  }
};
