import * as bcrypt from "bcryptjs";

export default async (
  passwordOnFile: string,
  loginPassword: string
): Promise<boolean> => bcrypt.compare(loginPassword, passwordOnFile);
