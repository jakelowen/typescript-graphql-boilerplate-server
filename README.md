Inspired by Ben Awad's https://github.com/benawad/graphql-ts-server-boilerplate

Difference's from Awad's version

- Uses knex and objectionjs instead of typeorm.
- DB schema types exported by schemats
- Uses JWT tokens instead of cookies. I found tokens much easier to validate when came to securing the websocket / subscriptions connections. JWT tokens are versioned to automatically invalidate "stale" tokens.
- Tests use apollo client directly instead of fetch. This allows for tests of authenticated subscriptions via websocket connections.
