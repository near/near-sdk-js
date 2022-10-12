import { executeCommand } from "./utils.js";
import signal from "signale";

const { Signale } = signal;

const signale = new Signale({ scope: "postinstall", interactive: true });

async function download(url: string, verbose = false) {
  await executeCommand(`curl -LOf ${url}`, verbose);
}

const OS = await executeCommand("uname -s", false);
const ARCH = await executeCommand("uname -m", false);

if (OS !== "Linux" && OS !== "Darwin") {
  console.error(`OS ${OS} is not supported at the moment`);
  process.exit(1);
}

if (ARCH !== "x86_64" && ARCH !== "arm64") {
  console.error(` ${ARCH} architecture is unsapported at the moment`);
  process.exit(1);
}

signale.await("Installing wasi-stub...");

const BINARYEN_VERSION = `0.1.10`;
const BINARYEN_VERSION_TAG = `v${BINARYEN_VERSION}`;
const BINARYEN_SYSTEM_NAME =
  OS === "Linux" ? "Linux" : OS === "Darwin" ? "macOS" : "other";
const BINARYEN_ARCH_NAME =
  ARCH === "x86_64" ? "X64" : ARCH === "arm64" ? "arm64" : "other";
const BINARYEN_TAR_NAME = `binaryen-${BINARYEN_SYSTEM_NAME}-${BINARYEN_ARCH_NAME}.tar.gz`;

await download(
  `https://github.com/near/binaryen/releases/download/${BINARYEN_VERSION_TAG}/${BINARYEN_TAR_NAME}`
);
await executeCommand(
  `mkdir -p binaryen && tar xvf ${BINARYEN_TAR_NAME} --directory binaryen`
);
await executeCommand(`rm ${BINARYEN_TAR_NAME}`);

signale.await("Installing QuickJS...");

const QUICK_JS_VERSION = `0.1.2`;
const QUICK_JS_VERSION_TAG = `v${QUICK_JS_VERSION}`;
const QUICK_JS_SYSTEM_NAME =
  OS === "Linux" ? "Linux" : OS === "Darwin" ? "macOS" : "other";
const QUICK_JS_ARCH_NAME =
  ARCH === "x86_64" ? "X64" : ARCH === "arm64" ? "arm64" : "other";
const QUICK_JS_TAR_NAME = `${QUICK_JS_VERSION_TAG}.tar.gz`;
const QUICK_JS_DOWNLOADED_FOLDER_NAME = `quickjs-${QUICK_JS_VERSION}`;
const QUICK_JS_TARGET_FOLDER_NAME = "quickjs";
const QUICK_JS_DOWNLOADED_NAME = `qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`;
const QUICK_JS_TARGET_NAME = "qjsc";

// Download QuickJS
await download(
  `https://github.com/near/quickjs/releases/download/${QUICK_JS_VERSION_TAG}/qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`
);
await download(
  `https://github.com/near/quickjs/archive/refs/tags/${QUICK_JS_VERSION_TAG}.tar.gz`
);

// Extract QuickJS
await executeCommand(`tar xvf ${QUICK_JS_TAR_NAME}`);

// Delete .tar file
await executeCommand(`rm ${QUICK_JS_TAR_NAME}`);

// Delete version from folder name
await executeCommand(
  `mv ${QUICK_JS_DOWNLOADED_FOLDER_NAME} ${QUICK_JS_TARGET_FOLDER_NAME}`
);

// Rename qjsc file
await executeCommand(`mv ${QUICK_JS_DOWNLOADED_NAME} ${QUICK_JS_TARGET_NAME}`);

// chmod qjsc
await executeCommand(`chmod 777 ${QUICK_JS_TARGET_NAME}`);

signale.await("Installing wasi-sdk...");

const WASI_SDK_MAJOR_VER = 11;
const WASI_SDK_MINOR_VER = 0;
const WASI_SDK_DOWNLOADED_FOLDER_NAME = `wasi-sdk-${WASI_SDK_MAJOR_VER}.${WASI_SDK_MINOR_VER}`;
const WASI_SDK_SYSTEM_NAME =
  OS === "Linux" ? "linux" : OS === "Darwin" ? "macos" : "other";
const WASI_SDK_TAR_NAME = `${WASI_SDK_DOWNLOADED_FOLDER_NAME}-${WASI_SDK_SYSTEM_NAME}.tar.gz`;

// Download WASI SDK
await download(
  `https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_SDK_MAJOR_VER}/${WASI_SDK_TAR_NAME}`
);

// Extract WASI SDK
await executeCommand(`tar xvf ${WASI_SDK_TAR_NAME}`);

// Delete .tar file
await executeCommand(`rm ${WASI_SDK_TAR_NAME}`);

// Delete version from folder name
await executeCommand(`mv ${WASI_SDK_DOWNLOADED_FOLDER_NAME} wasi-sdk`);

signale.success("Successfully finished postinstall script!");
