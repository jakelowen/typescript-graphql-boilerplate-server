import * as DataLoader from "dataloader";
import { usersFromIds } from "../user/shared/connectors/userById";
import { usersFromEmails } from "../user/shared/connectors/userByEmail";
import {
  userPermissionsByUserIds,
  TeamPermissionReturn
} from "../user/permissions/connectors/userPermissionsByUserId";
import mapToMany from "../../utils/mapToMany";
import mapTo from "../../utils/mapTo";
import { users, teams, permissions } from "../../types/dbschema";
import batchLoadPages from "./pagination/connectors/batchLoadPages";
import { teamsFromIds } from "../team/connectors/teamById";
import { permissionsByNames } from "../user/permissions/connectors/permissionByName";

export default () => ({
  userById: new DataLoader((ids: string[]) =>
    usersFromIds(ids).then(mapTo(ids, (x: users) => x.id))
  ),
  userByEmail: new DataLoader((emails: string[]) =>
    usersFromEmails(emails).then(mapTo(emails, (x: users) => x.email))
  ),
  userPermissionsByUserId: new DataLoader((ids: string[]) =>
    userPermissionsByUserIds(ids).then(
      mapToMany(ids, (x: TeamPermissionReturn) => x.userId)
    )
  ),
  pageLoader: new DataLoader((keys: string[]) => batchLoadPages(keys)),
  teamById: new DataLoader((ids: string[]) =>
    teamsFromIds(ids).then(mapTo(ids, (x: teams) => x.id))
  ),
  permissionByName: new DataLoader((names: string[]) =>
    permissionsByNames(names).then(mapTo(names, (x: permissions) => x.name))
  )
});
