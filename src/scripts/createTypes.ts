import { generateNamespace } from "@gql2ts/from-schema";
import * as fs from "fs";
import { genSchema } from "../utils/generateSchema";
import * as path from "path";

const typescriptTypes = generateNamespace("GQL", genSchema());
fs.writeFile(
  path.join(__dirname, "../types/schema.d.ts"),
  typescriptTypes,
  err => {
    console.log(err);
  }
);
