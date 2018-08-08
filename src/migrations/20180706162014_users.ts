import * as Knex from "knex";

exports.up = (knex: Knex): Promise<any> => {
  return Promise.all([
    knex.schema.createTable("users", t => {
      t.string("id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();

      t.dateTime("createdAt").defaultTo(knex.raw("now()"));
      t.dateTime("updatedAt").nullable();
      t.dateTime("deletedAt").nullable();

      t.string("firstName");
      t.string("lastName");
      t.string("email").notNullable();
      t.text("password").notNullable();
      t.boolean("confirmed").defaultTo(false);
    })
  ]);
};

exports.down = (knex: Knex): Promise<any> =>
  Promise.all([knex.schema.dropTable("users")]);
