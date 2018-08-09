// import { map } from "lodash";
// import { TeamPermissionReturn } from "../../shared/connectors/userTeamPermissionsByUserId";

// export interface TeamPermissions {
//   [teamId: string]: string[];
// }

// export default (userTeamPermissions: any) => {
//   const final: TeamPermissions = {};
//   userTeamPermissions.forEach((teamPermission: TeamPermissionReturn) => {
//     if (!(teamPermission.teamId in final)) {
//       final[teamPermission.teamId] = [];
//     }
//     final[teamPermission.teamId].push(teamPermission.permission);
//   });
//   return map(final, (value, key) => ({
//     team: key,
//     permissions: value
//   }));
// };
