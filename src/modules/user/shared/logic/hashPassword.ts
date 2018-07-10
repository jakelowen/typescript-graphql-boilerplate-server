import * as bcrypt from "bcryptjs";

export default async (password: string): Promise<string> =>
  bcrypt.hash(password, 10);
