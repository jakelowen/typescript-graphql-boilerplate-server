// import * as yup from "yup";
// import * as bcrypt from "bcryptjs";

// import { ResolverMap } from "../../types/graphql-utils";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { Session } from "../../types/graphql-utils";
// import { Session } from "../../types/graphql-utils";
// import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
// import { User } from "../../../entity/User";
// import { forgotPasswordPrefix } from "../../../constants";
// import { expiredKeyError } from "./errorMessages";
// import { registerPasswordValidation } from "../../../yupSchemas";
// import { formatYupError } from "../../../utils/formatYupError";

// const schema = yup.object().shape({
//   newPassword: registerPasswordValidation
// });

export const resolvers: any = {
  Subscription: {
    counter: {
      subscribe: (
        _: any,
        __: any,
        { pubsub, session }: { pubsub: RedisPubSub; session: Session }
      ) =>
        // context: any
        {
          console.log("!!!! session", session);
          const channel = Math.random()
            .toString(36)
            .substring(2, 15); // random channel name
          let count = 0;
          setInterval(
            () =>
              pubsub.publish(channel, {
                counter: { count: count++ }
              }),
            2000
          );
          return pubsub.asyncIterator(channel);
        }
    }
  }
};
