import * as Knex from "knex";

exports.up = (knex: Knex): Promise<any> =>
  Promise.all([knex.raw('create extension if not exists "uuid-ossp"')]);

exports.down = (knex: Knex): Promise<any> =>
  Promise.all([knex.raw('drop extension if exists "uuid-ossp" CASCADE')]);
