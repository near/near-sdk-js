#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { babel } from '@rollup/plugin-babel';

import { rollup } from 'rollup';

import { exec as exec_ } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const exec = promisify(exec_);

const OS = await executeCommand('uname -s', true);
const ARCH = await executeCommand('uname -m', true);
const QJSC_DIR = `./node_modules/near-sdk-js/quickjs`;
const QJSC_BUILDS_DIR = `./node_modules/near-sdk-js/cli/qjsc`;
const QJSC = `${QJSC_BUILDS_DIR}/${OS}-${ARCH}-qjsc`;

yargs(hideBin(process.argv))
    .scriptName('near-sdk')
    .usage('$0 <cmd> [args]')
    .command('build [source] [target]', 'Build NEAR JS Smart-contract', (yargs) => {
        yargs
            .positional('source', {
                type: 'string',
                default: 'src/index.js',
                describe: 'Contract to build'
            })
            .positional('target', {
                type: 'string',
                default: 'build/contract.wasm',
                describe: 'Target file path and name'
            })
    }, build)
    .help()
    .argv

async function build(argv) {
    const SOURCE_FILE_WITH_PATH = argv.source;
    const TARGET_DIR = path.dirname(argv.target);
    const TARGET_EXT = argv.target.split('.').pop();
    const TARGET_FILE_NAME = path.basename(argv.target, `.${TARGET_EXT}`);
    const TARGET_TYPE = TARGET_EXT === 'wasm' ? 'STANDALONE' : TARGET_EXT === 'base64' ? 'ENCLAVED' : undefined;

    const ROLLUP_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.js`;
    const QJSC_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.h`;
    const STANDALONE_CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.wasm`;
    const ENCLAVED_CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.base64`;

    console.log(`Building ${SOURCE_FILE_WITH_PATH} contract...`);

    console.log(`Creating ${TARGET_DIR} directory...`);
    await executeCommand(`mkdir -p ${TARGET_DIR}`);

    await createJsFileWithRullup(SOURCE_FILE_WITH_PATH, ROLLUP_TARGET);

    await cratreHeaderFileWithQjsc(ROLLUP_TARGET, QJSC_TARGET);

    if (TARGET_TYPE === 'STANDALONE') {
        // TODO: QJSC_TARGET is not used and hardcoded in C
        await createStandaloneMethodsHeaderFile(ROLLUP_TARGET);
        await createStandaloneWasmContract(STANDALONE_CONTRACT_TARGET);
        await cleanupStandaloneBuildArtifacts();
        await wasiStubStandaloneContract();
    } else if (TARGET_TYPE === 'ENCLAVED') {
        await createEnclavedContract(QJSC_TARGET, ENCLAVED_CONTRACT_TARGET);
        await cleanupEnclavedBuildArtifacts(QJSC_TARGET);
    } else {
        throw new Error('Unsupported target, make sure target ends with .wasm or .base64');
    }
}

// Common build function
async function createJsFileWithRullup(sourceFileWithPath, rollupTarget) {
    console.log(`Creating ${rollupTarget} file with Rollup...`);
    const bundle = await rollup({
        input: sourceFileWithPath,
        plugins: [
            nodeResolve(),
            sourcemaps(),
            // commonjs(),
            babel({ babelHelpers: 'bundled' })
        ],
    });

    await bundle.write({
        sourcemap: true,
        file: rollupTarget,
        format: 'es'
    });
}

async function cratreHeaderFileWithQjsc(rollupTarget, qjscTarget) {
    qjscTarget = `build/code.h`; // TODO: delete this dirty hack!
    console.log(`Creating ${qjscTarget} file with QJSC...`);
    await executeCommand(`${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`);
}

// Enclaved build functions
async function createEnclavedContract(qjscTarget, enclavedContractTarget) {
    console.log(`Saving enclaved bytecode to ${enclavedContractTarget}`);
    const SAVE_BYTECODE_SCRIPT = './node_modules/near-sdk-js/cli/save_bytecode.js';
    await executeCommand(`node ${SAVE_BYTECODE_SCRIPT} ${qjscTarget} ${enclavedContractTarget}`);
}

async function cleanupEnclavedBuildArtifacts(qjscTraget) {
    console.log(`Removing ${qjscTraget} ...`);
    await executeCommand(`rm ${qjscTraget}`);
}

// Standalone build functions
async function wasiStubStandaloneContract() {
    console.log(`Excecuting wasi-stup...`);
    const WASI_STUB = `${VENDOR_FOLDER}/binaryen/wasi-stub/run.sh`;
    await executeCommand(`${WASI_STUB} ${standaloneContractTarget} >/dev/null`);
}

async function cleanupStandaloneBuildArtifacts() {
    console.log(`Cleanup standalone build artifacts...`);
    await executeCommand(`rm code.h methods.h`);
}

async function createStandaloneMethodsHeaderFile(rollupTarget) {
    console.log(`Genereting methods.h file`);
    const CODEGEN_SCRIPT = './node_modules/near-sdk-js/cli/builder/codegen.js';
    await executeCommand(`node ${CODEGEN_SCRIPT} ${rollupTarget}`);
}

async function createStandaloneWasmContract(standaloneContractTarget) {
    console.log(`Creating ${standaloneContractTarget} contract...`);
    const VENDOR_FOLDER = 'node_modules/near-sdk-js/vendor';
    const WASI_SDK_PATH = `${VENDOR_FOLDER}/wasi-sdk-11.0`;

    const CC = `${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot`
    const DEFS = `-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM ${process.env.NEAR_NIGHTLY ? '-DNIGHTLY' : ''}`
    const INCLUDES = `-I${QJSC_DIR} -I.`
    const ORIGINAL_BUILDER_PATH = './node_modules/near-sdk-js/cli/builder/builder.c';
    const NEW_BUILDER_PATH = `${path.dirname(standaloneContractTarget)}/builder.c`
    const SOURCES = `${NEW_BUILDER_PATH} ${QJSC_DIR}/quickjs.c ${QJSC_DIR}/libregexp.c ${QJSC_DIR}/libunicode.c ${QJSC_DIR}/cutils.c ${QJSC_DIR}/quickjs-libc-min.c ${QJSC_DIR}/libbf.c`;
    const LIBS = `-lm`

    // copying builder.c file to the build folder (TODO: is there a better way to do this?)
    await executeCommand(`cp ${ORIGINAL_BUILDER_PATH} ${NEW_BUILDER_PATH}`);

    await executeCommand(`${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=$((256 * 1024)) -Wl,--lto-O3 -o ${standaloneContractTarget}`);
}

// Utils
async function executeCommand(command, silent = false) {
    console.log(command);
    const { error, stdout, stderr } = await exec(command);

    if (error) {
        console.log(error);
        process.exit(1);
    }
    if (stderr && !silent) {
        console.error(stderr);
    }

    if (silent) {
        return stdout.trim();
    } else {
        console.log(stdout);
    }
}