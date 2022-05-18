#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { babel } from '@rollup/plugin-babel';

import { rollup } from 'rollup';

import { exec } from 'child_process';

//TODO: build passed file instead of hardcoded one
yargs(hideBin(process.argv))
    .scriptName('near-sdk')
    .usage('$0 <cmd> [args]')
    .command('build', 'Build NEAR JS Smart-contract', (yargs) => {}, build)
    .help()
    .argv

async function build(argv) {
    console.log(`Building ${argv.contract} contract...`);

    console.log('Creating build directory...');
    executeCommand('mkdir build');

    console.log('Executing rollup...');
    const bundle = await rollup({
        input: 'src/index.js',
        plugins: [
            nodeResolve(),
            sourcemaps(),
            // commonjs(),
            babel({ babelHelpers: 'bundled' })
        ],
    });

    await bundle.write({
        sourcemap: true,
        file: 'build/contract.js',
        format: 'es'
    });

    console.log('Creating <>.base64 file with the use of QJSC...');
    const SAVE_BYTECODE = './node_modules/near-sdk-js/cli/save_bytecode.js';
    const QJSC = './node_modules/near-sdk-js/res/qjsc';
    const TEMP = 'build/contract.h';
    const TARGET = 'build/contract.base64';
    const CONTRACT_JS_FILE = 'build/contract.js';
    executeCommand(`${QJSC} -c -m -o ${TEMP} -N code ${CONTRACT_JS_FILE}`);
    executeCommand(`node ${SAVE_BYTECODE} ${TEMP} ${TARGET}`);
}

async function executeCommand(command) {
    console.log(command);
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            process.exit(1);
        }
        if (stderr) {
            console.log(stderr);
            process.exit(1);
        }
        console.log(stdout);
    });
}