#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { babel } from '@rollup/plugin-babel';

import { rollup } from 'rollup';

import { exec } from 'child_process';

//TODO: build passed file
yargs(hideBin(process.argv))
    .scriptName('near-sdk')
    .usage('$0 <cmd> [args]')
    .command('build <contract>', 'Build NEAR JS Smart-contract', (yargs) => {
        yargs.positional('contract', {
            type: 'string',
        })
    }, build)
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

    // Creating <>.base64 file with the used of QJSC
    executeCommand(`${QJSC} -c -m -o ${TEMP} -N code $1`);
    executeCommand(`node ${SCRIPT_DIR} /save_bytecode.js ${TEMP} ${TARGET}`);
    executeCommand(`rm ${TEMP}`);
}

function executeCommand(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(error);
            return;
        }
        if (stderr) {
            console.log(stderr);
            return;
        }
        console.log('Result', stdout);
    });
}