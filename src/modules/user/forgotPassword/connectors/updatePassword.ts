import db from "../../../../knex";
import { QueryBuilder } from "../../../../../node_modules/@types/knex";

export default (newPassword: string, userId: string): QueryBuilder =>
  db("users")
    .update({ password: newPassword })
    .where({
      id: userId
    });
