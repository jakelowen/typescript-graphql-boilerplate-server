import * as DataLoader from "dataloader";
import { usersFromIds } from "./userById";
import { usersFromEmails } from "./userByEmail";

export default () => ({
  userById: new DataLoader((ids: string[]) =>
    usersFromIds(ids).then(rows => ids.map(id => rows.find(x => x.id === id)))
  ),
  userByEmail: new DataLoader((emails: string[]) =>
    usersFromEmails(emails).then(rows =>
      emails.map(email => rows.find(x => x.email === email))
    )
  )
});
