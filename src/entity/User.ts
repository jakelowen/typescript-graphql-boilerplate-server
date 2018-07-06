import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
  createQueryBuilder
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { GrantedPermission } from "./GrantedPermission";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;

  @Column("varchar", { length: 255 })
  email: string;

  @Column("text") password: string;

  @Column("boolean", { default: false })
  confirmed: boolean;

  @OneToMany(
    _ => GrantedPermission,
    grantedPermission => grantedPermission.team,
    {
      cascade: true
    }
  )
  grantedPermissions: GrantedPermission[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  /* TODO */
  // TODO implement these permission checks
  async hasTeamPermission(teamId: string, permission: string) {
    const result = await createQueryBuilder("granted_permissions", "gp")
      .innerJoin("gp.permission", "perm")
      .where("gp.user = :user", { user: this.id })
      .andWhere("gp.team = :teamId", { teamId })
      .andWhere("perm.name = :permission", { permission })
      .printSql()
      .getOne();

    console.log(result);
    if (result) {
      return true;
    }
    return false;
  }

  /*
  hasAnyPermissions(firstName: string, lastName: string) {
    return this.createQueryBuilder("user")
      .where("user.firstName = :firstName", { firstName })
      .andWhere("user.lastName = :lastName", { lastName })
      .getMany();
  }*/
}
