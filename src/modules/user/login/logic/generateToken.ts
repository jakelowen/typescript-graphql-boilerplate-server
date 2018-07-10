import * as jwt from "jsonwebtoken";

export default (id: string, validTokenVersion: string): string => {
  return jwt.sign(
    {
      id,
      version: parseInt(validTokenVersion, 10)
    },
    process.env.JWT_SECRET as any,
    { expiresIn: "24h" }
  );
};
