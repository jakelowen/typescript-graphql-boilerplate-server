import { request } from 'graphql-request'
// import { host } from './constants'
// import { createConnection } from 'typeorm';
import { User } from '../../entity/User';
import { startServer } from '../../startServer'
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer()
  const { port }: any = app.address();
  getHost = () => `http://127.0.0.1:${port}`
});

const email = "bob@bob.com"
const password = "jalksdf"

const mutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`
test('Register User', async () => {
  // make sure we can register a user
  const response = await request(getHost(), mutation(email, password))
  expect(response).toEqual({ register: null })
  const users = await User.find({ where: { email } })
  expect(users).toHaveLength(1)
  const user = users[0]
  expect(user.email).toEqual(email)
  expect(user.password).not.toEqual(password)

  // test for duplicate emails
  const response2: any = await request(getHost(), mutation(email, password))
  expect(response2.register).toHaveLength(1)
  expect(response2.register[0]).toEqual({ path: "email", message: duplicateEmail })

  // catch bad email
  const response3: any = await request(getHost(), mutation("b", password))
  expect(response3).toEqual({
    register: [
      { "message": emailNotLongEnough, "path": "email" },
      { "message": invalidEmail, "path": "email" }
    ]
  })

  // catch bad password
  const response4: any = await request(getHost(), mutation(email, "ad"))
  expect(response4).toEqual({
    register: [
      { "message": passwordNotLongEnough, "path": "password" },
    ]
  })

  // catch bad password and bad email
  const response5: any = await request(getHost(), mutation("df", "ad"))
  expect(response5).toEqual({
    register: [
      { "message": emailNotLongEnough, "path": "email" },
      { "message": invalidEmail, "path": "email" },
      { "message": passwordNotLongEnough, "path": "password" },
    ]
  })
});