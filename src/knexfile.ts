// Update with your config settings.

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      username: "postgres",
      password: "",
      database: "graphql-ts-server-boilerplate"
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  test: {
    client: "postgresql",
    connection: {
      username: "postgres",
      password: "",
      database: "graphql-ts-server-boilerplate-test"
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
