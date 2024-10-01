import { executeCommand, download } from "./utils.js";
import signal from "signale";
import os from "os";
import fs from "fs";
const { Signale } = signal;
const signale = new Signale({ scope: "postinstall", interactive: true });
// Clean existing deps folder
process.chdir("lib/cli");
const DEPS = "deps";
fs.rmSync(DEPS, { recursive: true, force: true });
fs.mkdirSync(DEPS);
process.chdir(DEPS);
const PLATFORM = os.platform();
const ARCH = os.arch();
console.log(`Current platform: ${PLATFORM}, current architecture: ${ARCH}`);
const SUPPORTED_PLATFORMS = ["linux", "darwin"]; // Unsupported platforms: 'win32', 'aix', 'freebsd', 'openbsd', 'sunos', 'android'
const SUPPORTED_ARCH = ["x64", "arm64"]; // Unsupported arch: 'arm', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32'
if (!SUPPORTED_PLATFORMS.includes(PLATFORM)) {
    console.error(`Platform ${PLATFORM} is not supported at the moment`);
    process.exit(1);
}
if (!SUPPORTED_ARCH.includes(ARCH)) {
    console.error(`Architecture ${ARCH} is not supported at the moment`);
    process.exit(1);
}
signale.await("Installing wasi-stub...");
const BINARYEN_VERSION = `0.1.16`;
const BINARYEN_VERSION_TAG = `v${BINARYEN_VERSION}`;
const BINARYEN_SYSTEM_NAME = PLATFORM === "linux"
    ? "Linux"
    : PLATFORM === "darwin"
        ? "macOS"
        : PLATFORM === "win32"
            ? "windows"
            : "other";
const BINARYEN_ARCH_NAME = (ARCH == 'aarch64') ? 'ARM64' : ARCH.toUpperCase();
const BINARYEN_TAR_NAME = `binaryen-${BINARYEN_SYSTEM_NAME}-${BINARYEN_ARCH_NAME}.tar.gz`;
await download(`https://github.com/ailisp/binaryen/releases/download/${BINARYEN_VERSION_TAG}/${BINARYEN_TAR_NAME}`);
fs.mkdirSync("binaryen");
await executeCommand(`tar xvf ${BINARYEN_TAR_NAME} --directory binaryen`);
fs.rmSync(BINARYEN_TAR_NAME);
signale.await("Installing QuickJS...");
const QUICK_JS_VERSION = `0.1.3`;
const QUICK_JS_VERSION_TAG = `v${QUICK_JS_VERSION}`;
const QUICK_JS_SYSTEM_NAME = PLATFORM === "linux"
    ? "Linux"
    : PLATFORM === "darwin"
        ? "macOS"
        : PLATFORM === "win32"
            ? "windows"
            : "other";
const QUICK_JS_ARCH_NAME = ARCH === "x64" ? "X64" : ARCH === "arm64" ? "arm64" : "other";
const QUICK_JS_TAR_NAME = `${QUICK_JS_VERSION_TAG}.tar.gz`;
const QUICK_JS_DOWNLOADED_FOLDER_NAME = `quickjs-${QUICK_JS_VERSION}`;
const QUICK_JS_TARGET_FOLDER_NAME = "quickjs";
const QUICK_JS_DOWNLOADED_NAME = `qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`;
const QUICK_JS_TARGET_NAME = "qjsc";
// Download QuickJS
await download(`https://github.com/near/quickjs/releases/download/${QUICK_JS_VERSION_TAG}/qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`);
await download(`https://github.com/near/quickjs/archive/refs/tags/${QUICK_JS_VERSION_TAG}.tar.gz`);
// Extract QuickJS
await executeCommand(`tar xvf ${QUICK_JS_TAR_NAME}`);
// Delete .tar file
fs.rmSync(QUICK_JS_TAR_NAME);
// Delete version from folder name
fs.renameSync(QUICK_JS_DOWNLOADED_FOLDER_NAME, QUICK_JS_TARGET_FOLDER_NAME);
// Rename qjsc file
fs.renameSync(QUICK_JS_DOWNLOADED_NAME, QUICK_JS_TARGET_NAME);
// chmod qjsc
fs.chmodSync(QUICK_JS_TARGET_NAME, 0o755);
signale.await("Installing wasi-sdk...");
const WASI_SDK_MAJOR_VER = 11;
const WASI_SDK_MINOR_VER = 0;
const WASI_SDK_DOWNLOADED_FOLDER_NAME = `wasi-sdk-${WASI_SDK_MAJOR_VER}.${WASI_SDK_MINOR_VER}`;
const WASI_SDK_SYSTEM_NAME = PLATFORM === "linux"
    ? "linux"
    : PLATFORM === "darwin"
        ? "macos"
        : PLATFORM === "win32"
            ? "windows"
            : "other";
const WASI_SDK_TAR_NAME = `${WASI_SDK_DOWNLOADED_FOLDER_NAME}-${WASI_SDK_SYSTEM_NAME}.tar.gz`;
// Download WASI SDK
await download(`https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_SDK_MAJOR_VER}/${WASI_SDK_TAR_NAME}`);
// Extract WASI SDK
await executeCommand(`tar xvf ${WASI_SDK_TAR_NAME}`);
// Delete .tar file
fs.rmSync(WASI_SDK_TAR_NAME);
// Delete version from folder name
fs.renameSync(WASI_SDK_DOWNLOADED_FOLDER_NAME, "wasi-sdk");
signale.success("Successfully finished postinstall script!");
