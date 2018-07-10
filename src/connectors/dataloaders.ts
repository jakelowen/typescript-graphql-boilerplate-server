import * as DataLoader from "dataloader";
import { usersFromIds } from "./userById";
import { usersFromEmails } from "./userByEmail";
import {
  userTeamPermissionsByUserIds,
  TeamPermissionReturn
} from "./userTeamPermissionsByUserId";
import mapToMany from "../utils/mapToMany";
import mapTo from "../utils/mapTo";
import { users } from "../types/dbschema";

export default () => ({
  userById: new DataLoader((ids: string[]) =>
    usersFromIds(ids).then(mapTo(ids, (x: users) => x.id))
  ),
  userByEmail: new DataLoader((emails: string[]) =>
    usersFromEmails(emails).then(mapTo(emails, (x: users) => x.email))
  ),
  userTeamPermissionsByUserId: new DataLoader((ids: string[]) =>
    userTeamPermissionsByUserIds(ids).then(
      mapToMany(ids, (x: TeamPermissionReturn) => x.userId)
    )
  )
});
