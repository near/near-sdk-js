#!/usr/bin/env node
import fs from "fs/promises";
import path, { basename, dirname } from "path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { babel } from "@rollup/plugin-babel";
import { rollup } from "rollup";
import { Command } from "commander";
import signal from "signale";
import { executeCommand } from "./utils.js";
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
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(buildCom))
    .parse();
export async function buildCom(source, target, { verbose = false }) {
    const SOURCE_EXT = source.split(".").pop();
    const TARGET_DIR = dirname(target);
    const TARGET_EXT = target.split(".").pop();
    const TARGET_FILE_NAME = basename(target, `.${TARGET_EXT}`);
    const signale = new Signale({ scope: "build", interactive: true });
    if (TARGET_EXT !== "wasm") {
        signale.error(`Unsupported target ${TARGET_EXT}, make sure target ends with .wasm!`);
        process.exit(1);
    }
    const ROLLUP_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.js`;
    const QJSC_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.h`;
    const CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.wasm`;
    signale.await(`Building ${source} contract...`);
    if (SOURCE_EXT === "ts") {
        signale.await(`Typechecking ${source} with tsc...`);
        await checkTsBuildWithTsc(source, verbose);
    }
    signale.await(`Creating ${TARGET_DIR} directory...`);
    await executeCommand(`mkdir -p ${TARGET_DIR}`, verbose);
    signale.await(`Creating ${source} file with Rollup...`);
    await createJsFileWithRullup(source, ROLLUP_TARGET, verbose);
    signale.await(`Creating ${QJSC_TARGET} file with QJSC...`);
    await createHeaderFileWithQjsc(ROLLUP_TARGET, QJSC_TARGET, verbose);
    signale.await("Generating methods.h file...");
    await createMethodsHeaderFile(ROLLUP_TARGET, verbose);
    signale.await(`Creating ${CONTRACT_TARGET} contract...`);
    await createWasmContract(QJSC_TARGET, CONTRACT_TARGET, verbose);
    signale.await("Executing wasi-stub...");
    await wasiStubContract(CONTRACT_TARGET, verbose);
    signale.success(`Generated ${CONTRACT_TARGET} contract successfully!`);
}
async function checkTsBuildWithTsc(sourceFileWithPath, verbose = false) {
    await executeCommand(`${TSC} --noEmit --experimentalDecorators --target es2020 --moduleResolution node ${sourceFileWithPath}`, verbose);
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
        console.log(rollupTarget);
    }
    const mod = await import(`${PROJECT_DIR}/${rollupTarget}`);
    const exportNames = Object.keys(mod);
    const methods = exportNames.reduce((result, key) => `${result}DEFINE_NEAR_METHOD(${key})\n`, "");
    await fs.writeFile(`${buildPath}/methods.h`, methods);
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
    await executeCommand(`cp ${ORIGINAL_BUILDER_PATH} ${NEW_BUILDER_PATH}`, verbose);
    await executeCommand(`mv ${qjscTarget} build/code.h`, verbose);
    await executeCommand(`${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=${256 * 1024} -Wl,--lto-O3 -o ${contractTarget}`, verbose);
}
async function wasiStubContract(contractTarget, verbose = false) {
    const WASI_STUB = `${NEAR_SDK_JS}/lib/cli/deps/binaryen/wasi-stub/run.sh`;
    await executeCommand(`${WASI_STUB} ${contractTarget} >/dev/null`, verbose);
}
