import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

//TODO: execute it in js env
async function main(): Promise<void> {
  const source = resolve(process.argv[process.argv.length - 2]);
  const target = resolve(process.argv[process.argv.length - 1]);
  const code = await readFile(source, "utf-8");

  const codes = code
    .split("\n")
    .map((line) => {
      if (line.indexOf("0x") < 0) {
        return [];
      }

      const trimmedLine = line.trim();
      const numbers = trimmedLine.slice(0, trimmedLine.length - 1).split(", ");

      return numbers.map(Number);
    })
    .filter((numbers) => numbers.length);

  const bytecode = Buffer.concat(codes.map(Buffer.from));

  await writeFile(target, bytecode.toString("base64"));
}

main();
