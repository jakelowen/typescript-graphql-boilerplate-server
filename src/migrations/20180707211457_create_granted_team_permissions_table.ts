import * as Knex from "knex";

exports.up = (knex: Knex): Promise<any> => {
  return Promise.all([
    knex.schema.createTable("granted_team_permissions", t => {
      t.string("id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();

      t.dateTime("createdAt").defaultTo(knex.raw("now()"));
      t.dateTime("updatedAt").nullable();
      t.dateTime("deletedAt").nullable();

      t.string("teamId")
        .notNullable()
        .references("id")
        .inTable("teams");

      t.integer("permissionId")
        .notNullable()
        .references("id")
        .inTable("permissions");

      t.string("userId")
        .notNullable()
        .references("id")
        .inTable("users");
    })
  ]);
};

exports.down = (knex: Knex): Promise<any> =>
  Promise.all([knex.schema.dropTable("granted_team_permissions")]);
