import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

// used for deploy code in contract with near.promiseBatchActionDeployContract.
// Usage:
// node wasm_to_bytes.js contract.wasm contract.jsbytes
// copy paste the content of the contract.jsbytes, pass it as arguments to near.promiseBatchActionDeployContract:
// near.promiseBatchActionDeployContract(promsieId, '<content of contract.jsbytes>')
// Note, do not use `bytes()` type check here, which is too expensive for this long bytes and will exceed gas limit.
async function main(): Promise<void> {
  const source = resolve(process.argv[process.argv.length - 2]);
  const target = resolve(process.argv[process.argv.length - 1]);
  const code = await readFile(source);

  const result = code.reduce(
    (result, character) =>
      `${result}\\x${character.toString(16).padStart(2, "0")}`,
    ""
  );

  await writeFile(target, result);
}

main();
