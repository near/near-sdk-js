#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { babel } from '@rollup/plugin-babel';

import { rollup } from 'rollup';

import { exec as exec_ } from 'child_process';
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
    const OS = await executeCommand('uname -s', true);
    const ARCH = await executeCommand('uname -m', true);

    const SOURCE_FILE_WITH_PATH = argv.source;
    // TODO: parce path
    // const TARGET_DIR = getBuildDir(argv.target);
    // const TARGET_FILE_NAME = getTargetFileName(argv.target);
    const TARGET_DIR = 'build';
    const TARGET_FILE_NAME = 'contract';

    const ROLLUP_TARGET = `${TARGET_DIR}${TARGET_FILE_NAME}.js`;
    const QJS_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.h`;
    const CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.base64`;

    const SAVE_BYTECODE_SCRIPT = './node_modules/near-sdk-js/cli/save_bytecode.js';
    const QJSC = `./node_modules/near-sdk-js/res/${OS}-${ARCH}-qjsc`;

    console.log(`Building ${SOURCE_FILE_WITH_PATH} contract...`);

    console.log(`Creating ${TARGET_DIR} directory...`);
    await executeCommand(`mkdir -p ${TARGET_DIR}`);

    console.log(`Creating ${ROLLUP_TARGET} file with Rollup...`);
    const bundle = await rollup({
        input: SOURCE_FILE_WITH_PATH,
        plugins: [
            nodeResolve(),
            sourcemaps(),
            // commonjs(),
            babel({ babelHelpers: 'bundled' })
        ],
    });

    await bundle.write({
        sourcemap: true,
        file: ROLLUP_TARGET,
        format: 'es'
    });

    console.log(`Creating ${QJS_TARGET} file with QJSC...`);
    await executeCommand(`${QJSC} -c -m -o ${QJS_TARGET} -N code ${ROLLUP_TARGET}`);

    console.log(`Saving bytecode to ${CONTRACT_TARGET}`);
    await executeCommand(`node ${SAVE_BYTECODE_SCRIPT} ${QJS_TARGET} ${CONTRACT_TARGET}`);
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