#!/usr/bin/env node

import fs from "fs";
import path, { basename, dirname } from "path";

import { nodeResolve } from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { babel } from "@rollup/plugin-babel";
import { rollup } from "rollup";
import { Command } from "commander";
import signal from "signale";

import { executeCommand, validateContract } from "./utils.js";
import { runAbiCompilerPlugin } from "./abi.js";

const { Signale } = signal;
const PROJECT_DIR = process.cwd();
const NEAR_SDK_JS = "node_modules/near-sdk-js";
const TSC = "node_modules/.bin/tsc";
const QJSC_DIR = `${NEAR_SDK_JS}/lib/cli/deps/quickjs`;
const QJSC = `${NEAR_SDK_JS}/lib/cli/deps/qjsc`;

const program = new Command();

program
  .name("near-sdk-js")
  .addCommand(
    new Command("build")
      .usage("[source] [target]")
      .description("Build NEAR JS Smart-contract")
      .argument("[source]", "Contract to build.", "src/index.js")
      .argument("[target]", "Target file path and name.", "build/contract.wasm")
      .argument("[packageJson]", "Target file path and name.", "package.json")
      .argument("[tsConfig]", "Target file path and name.", "tsconfig.json")
      .option("--verbose", "Whether to print more verbose output.", false)
      .option("--generateABI", "Whether to generate ABI.", false)
      .action(buildCom)
  )
  .addCommand(
    new Command("validateContract")
      .usage("[source]")
      .description(
        "Validate a NEAR JS Smart-contract. Validates the contract by checking that all parameters are initialized in the constructor. Works only for typescript."
      )
      .argument("[source]", "Contract to validate.", "src/index.ts")
      .option("--verbose", "Whether to print more verbose output.", false)
      .action(validateCom)
  )
  .addCommand(
    new Command("checkTypescript")
      .usage("[source]")
      .description(
        "Run TSC with some cli flags - warning - ignores tsconfig.json."
      )
      .argument("[source]", "Typescript file to validate", "src/index.ts")
      .option("--verbose", "Whether to print more verbose output.", false)
      .action(checkTypescriptCom)
  )
  .addCommand(
    new Command("createJsFileWithRullup")
      .usage("[source] [target]")
      .description(
        "Create intermediate javascript file for later processing with QJSC"
      )
      .argument("[source]", "Contract to build.", "src/index.js")
      .argument(
        "[target]",
        "Target file path and name. The default corresponds to contract.js",
        "build/contract.wasm"
      )
      .option("--verbose", "Whether to print more verbose output.", false)
      .action(createJsFileWithRollupCom)
  )
  .addCommand(
    new Command("transpileJsAndBuildWasm")
      .usage("[source] [target]")
      .description(
        "Transpiles the target javascript file into .c and .h using QJSC then compiles that into wasm using clang"
      )
      .argument(
        "[target]",
        "Target file path and name. The js file must correspond to the same path with the js extension.",
        "build/contract.wasm"
      )
      .option("--verbose", "Whether to print more verbose output.", false)
      .action(transpileJsAndBuildWasmCom)
  )
  .parse();

function getTargetDir(target: string): string {
  return dirname(target);
}

function getTargetExt(target: string): string {
  return target.split(".").pop();
}

function getTargetFileName(target: string): string {
  return basename(target, `.${getTargetExt(target)}`);
}

function getRollupTarget(target: string): string {
  return `${getTargetDir(target)}/${getTargetFileName(target)}.js`;
}

function getQjscTarget(target: string): string {
  return `${getTargetDir(target)}/${getTargetFileName(target)}.h`;
}

function getContractTarget(target: string): string {
  return `${getTargetDir(target)}/${getTargetFileName(target)}.wasm`;
}

function getContractAbi(target: string): string {
  return `${getTargetDir(target)}/${getTargetFileName(target)}-abi.json`;
}

function requireTargetExt(target: string): void {
  if (getTargetExt(target) === "wasm") {
    return;
  }

  signal.error(
    `Unsupported target ${getTargetExt(
      target
    )}, make sure target ends with .wasm!`
  );
  process.exit(1);
}

function ensureTargetDirExists(target: string): void {
  const targetDir = getTargetDir(target);
  if (fs.existsSync(targetDir)) {
    return;
  }

  signal.await(`Creating ${targetDir} directory...`);
  fs.mkdirSync(targetDir, {});
}

export async function validateCom(
  source: string,
  { verbose = false }: { verbose: boolean }
): Promise<void> {
  const signale = new Signale({ scope: "validate", interactive: !verbose });

  signale.await(`Validating ${source} contract...`);

  if (!(await validateContract(source, verbose))) {
    process.exit(1);
  }
}

export async function checkTypescriptCom(
  source: string,
  { verbose = false }: { verbose: boolean }
): Promise<void> {
  const signale = new Signale({
    scope: "checkTypescript",
    interactive: !verbose,
  });

  const sourceExt = source.split(".").pop();
  if (sourceExt !== "ts") {
    signale.info(`Source file is not a typescript file ${source}`);
    return;
  }

  signale.await(`Typechecking ${source} with tsc...`);
  await checkTsBuildWithTsc(source, verbose);
}

export async function generateAbi(
  source: string,
  target: string,
  packageJson: string,
  tsConfig: string,
  { verbose = false }: { verbose: boolean }
): Promise<void> {
  const signale = new Signale({ scope: "generateAbi", interactive: !verbose });

  const sourceExt = source.split(".").pop();
  if (sourceExt !== "ts") {
    signale.info(
      `Skipping ABI generation as source file is not a typescript file ${source}`
    );
    return;
  }

  signale.await("Generating ABI...");
  const abi = runAbiCompilerPlugin(source, packageJson, tsConfig);
  fs.writeFileSync(getContractAbi(target), JSON.stringify(abi, null, 2));
  signale.success(`Generated ${getContractAbi(target)} ABI successfully!`);
}

export async function createJsFileWithRollupCom(
  source: string,
  target: string,
  { verbose = false }: { verbose: boolean }
): Promise<void> {
  const signale = new Signale({
    scope: "createJsFileWithRollup",
    interactive: !verbose,
  });

  requireTargetExt(target);
  ensureTargetDirExists(target);

  signale.await(`Creating ${source} file with Rollup...`);
  await createJsFileWithRullup(source, getRollupTarget(target), verbose);
}

export async function transpileJsAndBuildWasmCom(
  target: string,
  { verbose = false }: { verbose: boolean }
): Promise<void> {
  const signale = new Signale({
    scope: "transpileJsAndBuildWasm",
    interactive: !verbose,
  });

  requireTargetExt(target);
  ensureTargetDirExists(target);

  signale.await(`Creating ${getQjscTarget(target)} file with QJSC...`);
  await createHeaderFileWithQjsc(
    getRollupTarget(target),
    getQjscTarget(target),
    verbose
  );

  signale.await("Generating methods.h file...");
  await createMethodsHeaderFile(getRollupTarget(target), verbose);

  signale.await(`Creating ${getContractTarget(target)} contract...`);
  await createWasmContract(
    getQjscTarget(target),
    getContractTarget(target),
    verbose
  );

  signale.await("Executing wasi-stub...");
  await wasiStubContract(getContractTarget(target), verbose);

  signale.success(
    `Generated ${getContractTarget(target)} contract successfully!`
  );
}

export async function buildCom(
  source: string,
  target: string,
  packageJson: string,
  tsConfig: string,
  { verbose = false, generateABI = false }: { verbose: boolean, generateABI: boolean },
): Promise<void> {
  const signale = new Signale({ scope: "build", interactive: !verbose });

  requireTargetExt(target);

  signale.await(`Building ${source} contract...`);

  await checkTypescriptCom(source, { verbose });

  ensureTargetDirExists(target);

  if (generateABI) {
    await generateAbi(source, target, packageJson, tsConfig, { verbose });
  }

  await validateCom(source, { verbose });

  await createJsFileWithRollupCom(source, target, { verbose });

  await transpileJsAndBuildWasmCom(target, { verbose });
}

async function checkTsBuildWithTsc(
  sourceFileWithPath: string,
  verbose = false
) {
  await executeCommand(
    `${TSC} --noEmit --skipLibCheck --experimentalDecorators --target es2020 --moduleResolution node ${sourceFileWithPath}`,
    verbose
  );
}

// Common build function
async function createJsFileWithRullup(
  sourceFileWithPath: string,
  rollupTarget: string,
  verbose = false
) {
  const bundle = await rollup({
    input: sourceFileWithPath,
    plugins: [
      nodeResolve({
        extensions: [".js", ".ts"],
      }),
      sourcemaps(),
      // commonjs(),
      babel({
        babelHelpers: "bundled",
        extensions: [".ts", ".js", ".jsx", ".es6", ".es", ".mjs"],
        presets: ["@babel/preset-typescript"],
        plugins: [
          "near-sdk-js/lib/cli/build-tools/include-bytes.js",
          [
            "near-sdk-js/lib/cli/build-tools/near-bindgen-exporter.js",
            { verbose },
          ],
          ["@babel/plugin-proposal-decorators", { version: "legacy" }],
        ],
      }),
    ],
  });

  await bundle.write({
    sourcemap: true,
    file: rollupTarget,
    format: "es",
  });
}

async function createHeaderFileWithQjsc(
  rollupTarget: string,
  qjscTarget: string,
  verbose = false
) {
  await executeCommand(
    `${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`,
    verbose
  );
}

async function createMethodsHeaderFile(rollupTarget: string, verbose = false) {
  const buildPath = path.dirname(rollupTarget);

  if (verbose) {
    new Signale({ scope: "method-header" }).info(rollupTarget);
  }

  const mod = await import(`${PROJECT_DIR}/${rollupTarget}`);
  const exportNames = Object.keys(mod);
  const methods = exportNames.reduce(
    (result, key) => `${result}DEFINE_NEAR_METHOD(${key})\n`,
    ""
  );

  fs.writeFileSync(`${buildPath}/methods.h`, methods);
}

async function createWasmContract(
  qjscTarget: string,
  contractTarget: string,
  verbose = false
) {
  const WASI_SDK_PATH = `${NEAR_SDK_JS}/lib/cli/deps/wasi-sdk`;

  const CC = `${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot`;
  let DEFS = `-D_GNU_SOURCE '-DCONFIG_VERSION="2021-03-27"' -DCONFIG_BIGNUM`;

  if (process.env.NEAR_NIGHTLY) {
    DEFS = DEFS + " -DNIGHTLY";
  }

  const INCLUDES = `-I${QJSC_DIR} -I.`;
  const ORIGINAL_BUILDER_PATH = `${NEAR_SDK_JS}/builder/builder.c`;
  const NEW_BUILDER_PATH = `${path.dirname(contractTarget)}/builder.c`;
  const SOURCES = `${NEW_BUILDER_PATH} ${QJSC_DIR}/quickjs.c ${QJSC_DIR}/libregexp.c ${QJSC_DIR}/libunicode.c ${QJSC_DIR}/cutils.c ${QJSC_DIR}/quickjs-libc-min.c ${QJSC_DIR}/libbf.c`;
  const LIBS = `-lm`;

  // copying builder.c file to the build folder
  fs.cpSync(ORIGINAL_BUILDER_PATH, NEW_BUILDER_PATH);

  fs.renameSync(qjscTarget, "build/code.h");

  await executeCommand(
    `${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=${
      256 * 1024
    } -Wl,--lto-O3 -o ${contractTarget}`,
    verbose
  );
}

async function wasiStubContract(contractTarget: string, verbose = false) {
  const WASI_STUB = `${NEAR_SDK_JS}/lib/cli/deps/binaryen/wasi-stub/run.sh`;
  await executeCommand(`${WASI_STUB} ${contractTarget} >/dev/null`, verbose);
}
