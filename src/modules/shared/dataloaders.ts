import * as DataLoader from "dataloader";
import { usersFromIds } from "../user/shared/connectors/userById";
import { usersFromEmails } from "../user/shared/connectors/userByEmail";
import {
  userTeamPermissionsByUserIds,
  TeamPermissionReturn
} from "../user/shared/connectors/userTeamPermissionsByUserId";
import mapToMany from "../../utils/mapToMany";
import mapTo from "../../utils/mapTo";
import { users, teams } from "../../types/dbschema";
import batchLoadPages from "./pagination/connectors/batchLoadPages";
import { teamsFromIds } from "../team/connectors/teamById";

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
  ),
  pageLoader: new DataLoader((keys: string[]) => batchLoadPages(keys)),
  teamById: new DataLoader((ids: string[]) =>
    teamsFromIds(ids).then(mapTo(ids, (x: teams) => x.id))
  )
});
