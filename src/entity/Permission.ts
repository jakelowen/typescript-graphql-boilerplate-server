import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany
} from "typeorm";
import { GrantedPermission } from "./GrantedPermission";

@Entity("permissions")
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

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
