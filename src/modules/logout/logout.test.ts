import { Connection } from "typeorm";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/TestClient";

let conn: Connection;
let userId: string;
const email = "bob5@bob.com";
const password = "fdsafasdsa";

beforeAll(async () => {
  conn = await createTypeormConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});
afterAll(async () => {
  conn.close();
});

describe("logout", () => {
  test("multiple sessions", async () => {
    const ss1 = new TestClient(process.env.TEST_HOST as string);
    const ss2 = new TestClient(process.env.TEST_HOST as string);

    await ss1.login(email, password);
    await ss2.login(email, password);
    expect(await ss1.me()).toEqual(await ss2.me());

    await ss1.logout();
    expect(await ss1.me()).toEqual(await ss2.me());
  });

  test("single session", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.me).toBeNull();
  });
});
