## NEXT UP

- tests for pagination/loadSinglePage
- tests for pagination/batchLoadPages
- tests for pagination/decodeDeterministicCacheId
- tests for pagination/generateDeterministicCacheId
- Do I need to utilize dataloader to separately grab items from redis (i.e. loadSinge page line 10?) Could that be reused any time I need to grab redis data?
- restructure dataloaders. Helper functions should live in modules. Dataloader file itself is fine, but probably doesnt need own folder.
- explore idea: in the same way I have a reusable structure for pages, can I do the same for singular fetches to avoid boilerplate? Like PageInfo type, but for singular
- add teams resolvers for full crud
- add userPermissions query
- add team permissions query (list all users and their permissions). Only team admins can use.
- CRUD for permissions.
- should you be able to include ttl as an argument from client on cached queries?
- add logging library middleware
- Deploy to now.sh
- turn back on user emailing stuff, consider abstracting mailer out into object in context and include mocked instance in testing?

## FUTURE
