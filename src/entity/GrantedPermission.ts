import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne
} from "typeorm";
import { Team } from "./Team";
import { Permission } from "./Permission";
import { User } from "./User";

@Entity("granted_permissions")
export class GrantedPermission extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column("varchar", { length: 255 })
  name: string;

  @ManyToOne(_ => Team, team => team.grantedPermissions, { nullable: false })
  team: Team;

  @ManyToOne(_ => Permission, permission => permission.grantedPermissions, {
    nullable: false
  })
  permission: Permission;

  @ManyToOne(_ => User, user => user.grantedPermissions, { nullable: false })
  user: User;
}
