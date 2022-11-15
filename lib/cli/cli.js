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
    .addCommand(new Command("build")
    .usage("[source] [target]")
    .description("Build NEAR JS Smart-contract")
    .argument("[source]", "Contract to build.", "src/index.js")
    .argument("[target]", "Target file path and name.", "build/contract.wasm")
    .argument("[packageJson]", "Target file path and name.", "package.json")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(buildCom))
    .addCommand(new Command("validateContract")
    .usage("[source]")
    .description("Validate a NEAR JS Smart-contract. Validates the contract by checking that all parameters are initialized in the constructor. Works only for typescript.")
    .argument("[source]", "Contract to validate.", "src/index.ts")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(validateCom))
    .addCommand(new Command("checkTypescript")
    .usage("[source]")
    .description("Run TSC with some cli flags - warning - ignores tsconfig.json.")
    .argument("[source]", "Typescript file to validate", "src/index.ts")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(checkTypescriptCom))
    .addCommand(new Command("createJsFileWithRullup")
    .usage("[source] [target]")
    .description("Create intermediate javascript file for later processing with QJSC")
    .argument("[source]", "Contract to build.", "src/index.js")
    .argument("[target]", "Target file path and name. The default corresponds to contract.js", "build/contract.wasm")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(createJsFileWithRullupCom))
    .addCommand(new Command("transpileJsAndBuildWasm")
    .usage("[source] [target]")
    .description("Transpiles the target javascript file into .c and .h using QJSC then compiles that into wasm using clang")
    .argument("[target]", "Target file path and name. The js file must correspond to the same path with the js extension.", "build/contract.wasm")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(transpileJsAndBuildWasmCom))
    .parse();
function getTargetDir(target) {
    return dirname(target);
}
function getTargetExt(target) {
    return target.split(".").pop();
}
function getTargetFileName(target) {
    return basename(target, `.${getTargetExt(target)}`);
}
function getRollupTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.js`;
}
function getQjscTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.h`;
}
function getContractTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.wasm`;
}
function getContractAbi(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}-abi.json`;
}
function requireTargetExt(target) {
    if (getTargetExt(target) === "wasm") {
        return;
    }
    signal.error(`Unsupported target ${getTargetExt(target)}, make sure target ends with .wasm!`);
    process.exit(1);
}
function ensureTargetDirExists(target) {
    const targetDir = getTargetDir(target);
    if (fs.existsSync(targetDir)) {
        return;
    }
    signal.await(`Creating ${targetDir} directory...`);
    fs.mkdirSync(targetDir, {});
}
export async function validateCom(source, { verbose = false }) {
    signal.await(`Validating ${source} contract...`);
    if (!await validateContract(source, verbose)) {
        process.exit(1);
    }
}
export async function checkTypescriptCom(source, { verbose = false }) {
    const sourceExt = source.split(".").pop();
    if (sourceExt !== "ts") {
        signal.info(`Source file is not a typescript file ${source}`);
        return;
    }
    signal.await(`Typechecking ${source} with tsc...`);
    await checkTsBuildWithTsc(source, verbose);
}
export async function generateAbi(source, target, packageJson) {
    const sourceExt = source.split(".").pop();
    if (sourceExt !== "ts") {
        signal.info(`Skipping ABI generation as source file is not a typescript file ${source}`);
        return;
    }
    signal.await("Generating ABI...");
    const abi = runAbiCompilerPlugin(source, packageJson);
    fs.writeFileSync(getContractAbi(target), JSON.stringify(abi, null, 2));
    signal.success(`Generated ${getContractAbi(target)} ABI successfully!`);
}
export async function createJsFileWithRullupCom(source, target, { verbose = false }) {
    requireTargetExt(target);
    ensureTargetDirExists(target);
    signal.await(`Creating ${source} file with Rollup...`);
    await createJsFileWithRullup(source, getRollupTarget(target), verbose);
}
export async function transpileJsAndBuildWasmCom(target, { verbose = false }) {
    requireTargetExt(target);
    ensureTargetDirExists(target);
    signal.await(`Creating ${getQjscTarget(target)} file with QJSC...`);
    await createHeaderFileWithQjsc(getRollupTarget(target), getQjscTarget(target), verbose);
    signal.await("Generating methods.h file...");
    await createMethodsHeaderFile(getRollupTarget(target), verbose);
    signal.await(`Creating ${getContractTarget(target)} contract...`);
    await createWasmContract(getQjscTarget(target), getContractTarget(target), verbose);
    signal.await("Executing wasi-stub...");
    await wasiStubContract(getContractTarget(target), verbose);
    signal.success(`Generated ${getContractTarget(target)} contract successfully!`);
}
export async function buildCom(source, target, packageJson, { verbose = false }) {
    requireTargetExt(target);
    signal.await(`Building ${source} contract...`);
    await checkTypescriptCom(source, { verbose });
    await generateAbi(source, target, packageJson);
    ensureTargetDirExists(target);
    await validateCom(source, { verbose });
    await createJsFileWithRullupCom(source, target, { verbose });
    await transpileJsAndBuildWasmCom(target, { verbose });
}
async function checkTsBuildWithTsc(sourceFileWithPath, verbose = false) {
    await executeCommand(`${TSC} --noEmit --skipLibCheck --experimentalDecorators --target es2020 --moduleResolution node ${sourceFileWithPath}`, verbose);
}
// Common build function
async function createJsFileWithRullup(sourceFileWithPath, rollupTarget, verbose = false) {
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
                    "near-sdk-js/lib/build-tools/include-bytes.js",
                    ["near-sdk-js/lib/build-tools/near-bindgen-exporter.js", { verbose }],
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
async function createHeaderFileWithQjsc(rollupTarget, qjscTarget, verbose = false) {
    await executeCommand(`${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`, verbose);
}
async function createMethodsHeaderFile(rollupTarget, verbose = false) {
    const buildPath = path.dirname(rollupTarget);
    if (verbose) {
        new Signale({ scope: "method-header" }).info(rollupTarget);
    }
    const mod = await import(`${PROJECT_DIR}/${rollupTarget}`);
    const exportNames = Object.keys(mod);
    const methods = exportNames.reduce((result, key) => `${result}DEFINE_NEAR_METHOD(${key})\n`, "");
    fs.writeFileSync(`${buildPath}/methods.h`, methods);
}
async function createWasmContract(qjscTarget, contractTarget, verbose = false) {
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
    await executeCommand(`${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=${256 * 1024} -Wl,--lto-O3 -o ${contractTarget}`, verbose);
}
async function wasiStubContract(contractTarget, verbose = false) {
    const WASI_STUB = `${NEAR_SDK_JS}/lib/cli/deps/binaryen/wasi-stub/run.sh`;
    await executeCommand(`${WASI_STUB} ${contractTarget} >/dev/null`, verbose);
}
