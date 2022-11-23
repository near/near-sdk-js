import * as fs from "fs";
import { fileURLToPath } from "url";

const PACKAGE_JSON = JSON.parse(
  fs.readFileSync(
    fileURLToPath(new URL("../package.json", import.meta.url)),
    "utf-8"
  )
);
export const LIB_VERSION: string = PACKAGE_JSON["version"];
