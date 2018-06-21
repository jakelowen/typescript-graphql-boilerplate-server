import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from 'bcryptjs';
import { User } from "../../entity/User";

export const resolvers: ResolverMap = {
  Query: {
    dummy1: () => "dummy1"
  },
  Mutation: {
    register: async (_, { email, password }: GQL.IRegisterOnMutationArguments) => {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = User.create({
        email,
        password: hashedPassword
      })
      await user.save()
      return true
    }
  }
}