import { executeCommand } from './utils.js';

const OS = await executeCommand('uname -s', true);
const ARCH = await executeCommand('uname -m', true);

if (OS !== 'Linux' && OS !== 'Darwin') {
    console.error(`OS ${OS} is not supported at the moment`);
    process.exit(1);
}

if (ARCH !== 'x86_64' && ARCH !== 'arm64') {
    console.error(` ${ARCH} architecture is unsapported at the moment`);
    process.exit(1);
}

console.log('Installing wasi-stub...');
// TODO

console.log('Installing QuickJS...');
//TODO:

console.log('Installing wasi-sdk...');
const MAJOR_VER = 11;
const MINOR_VER = 0;
const VERSION = `${MAJOR_VER}.${MINOR_VER}`;
const SYSTEM_NAME = OS === 'Linux' ? 'linux' : OS === 'Darwin' ? 'macos' : 'other';
const DOWNLOADED_FOLDER_NAME = `wasi-sdk-${VERSION}`
const TAR_NAME = `${DOWNLOADED_FOLDER_NAME}-${SYSTEM_NAME}.tar.gz`
const TARGET_FOLDER_NAME = 'wasi-sdk';

// Download WASI SDK
await executeCommand(`wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/${TAR_NAME}`);
// Extract WASI SDK
await executeCommand(`tar xvf ${TAR_NAME}`);
// Delete .tar file
await executeCommand(`rm ${TAR_NAME}`);
// Delete version from folder name
await executeCommand(`mv ${DOWNLOADED_FOLDER_NAME} ${TARGET_FOLDER_NAME}`);

