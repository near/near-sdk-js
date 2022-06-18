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
                default: 'build/contract.base64',
                describe: 'Target file path and name'
            })
    }, build)
    .help()
    .argv

async function build(argv) {
    const SOURCE_FILE_WITH_PATH = argv.source;
    const TARGET_DIR = path.dirname(argv.target);
    const TARGET_FILE_NAME = path.basename(argv.target, '.base64');

    const ROLLUP_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.js`;
    const QJSC_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.h`;
    const STANDALONE_CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.wasm`;
    const ENCLAVED_CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.base64`;

    console.log(`Building ${SOURCE_FILE_WITH_PATH} contract...`);

    console.log(`Creating ${TARGET_DIR} directory...`);
    await executeCommand(`mkdir -p ${TARGET_DIR}`);

    await createJsFileWithRullup(SOURCE_FILE_WITH_PATH, ROLLUP_TARGET);

    await cratreHeaderFileWithQjsc(ROLLUP_TARGET, QJSC_TARGET);

    const ENCLAVED = true; // TODO: pass as a parameter
    if (ENCLAVED) {
        await createEnclavedContract(QJSC_TARGET, ENCLAVED_CONTRACT_TARGET);
    } else {
        await createStandaloneContract(QJSC_TARGET, STANDALONE_CONTRACT_TARGET);
    }
}

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
    const OS = await executeCommand('uname -s', true);
    const ARCH = await executeCommand('uname -m', true);
    const QJSC = `./node_modules/near-sdk-js/cli/qjsc/${OS}-${ARCH}-qjsc`;
    console.log(`Creating ${qjscTarget} file with QJSC...`);
    await executeCommand(`${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`);
}

async function createEnclavedContract(qjscTarget, enclavedContractTarget) {
    const SAVE_BYTECODE_SCRIPT = './node_modules/near-sdk-js/cli/save_bytecode.js';
    console.log(`Saving enclaved bytecode to ${enclavedContractTarget}`);
    await executeCommand(`node ${SAVE_BYTECODE_SCRIPT} ${qjscTarget} ${enclavedContractTarget}`);
}

async function createStandaloneContract(qjsscTarget, standaloneContractTarget) {
    // TODO: move second half of the builder/builder.sh here
}


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