import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany
} from "typeorm";
import { GrantedPermission } from "./GrantedPermission";

@Entity("teams")
export class Team extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @Column("varchar", { length: 255 })
  name: string;

  @OneToMany(
    _ => GrantedPermission,
    grantedPermission => grantedPermission.team,
    {
      cascade: true
    }
  )
  grantedPermissions: GrantedPermission[];
}
