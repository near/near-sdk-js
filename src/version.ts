import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const PACKAGE_JSON = JSON.parse(
  fs.readFileSync(
    path.join(fileURLToPath(import.meta.url), "..", "..", "package.json"),
    "utf-8"
  )
);
export const LIB_VERSION: string = PACKAGE_JSON["version"];
