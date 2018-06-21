import { request } from 'graphql-request'
// import { host } from './constants'
// import { createConnection } from 'typeorm';
import { User } from '../../entity/User';
import { startServer } from '../../startServer'

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer()
  const { port }: any = app.address();
  getHost = () => `http://127.0.0.1:${port}`
});

const email = "bob@bob.com"
const password = "jalksdf"

const mutation = `
mutation {
  register(email: "${email}", password: "${password}") {
    path
    message
  }
}
`
test('Register User', async () => {
  const response = await request(getHost(), mutation)
  expect(response).toEqual({ register: null })
  const users = await User.find({ where: { email } })
  expect(users).toHaveLength(1)
  const user = users[0]
  expect(user.email).toEqual(email)
  expect(user.password).not.toEqual(password)

  const response2: any = await request(getHost(), mutation)
  expect(response2.register).toHaveLength(1)
  expect(response2.register[0].path).toEqual("email")
});