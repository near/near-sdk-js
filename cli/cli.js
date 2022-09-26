#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { nodeResolve } from '@rollup/plugin-node-resolve'
import sourcemaps from 'rollup-plugin-sourcemaps'
import { babel } from '@rollup/plugin-babel'
import { rollup } from 'rollup'

import { executeCommand } from './utils.js'

const PROJECT_DIR = process.cwd()
const NEAR_SDK_JS = 'node_modules/near-sdk-js'
const TSC = 'node_modules/.bin/tsc'
const QJSC_DIR = `${NEAR_SDK_JS}/cli/deps/quickjs`
const QJSC = `${NEAR_SDK_JS}/cli/deps/qjsc`

yargs(hideBin(process.argv))
  .scriptName('near-sdk-js')
  .usage('$0 <cmd> [args]')
  .command(
    'build [source] [target]',
    'Build NEAR JS Smart-contract',
    (yargs) => {
      yargs
        .positional('source', {
          type: 'string',
          default: 'src/index.js',
          describe: 'Contract to build',
        })
        .positional('target', {
          type: 'string',
          default: 'build/contract.wasm',
          describe: 'Target file path and name',
        })
    },
    build
  )
  .help().argv

async function build(argv) {
  const SOURCE_FILE_WITH_PATH = argv.source
  const SOURCE_EXT = argv.source.split('.').pop()
  const TARGET_DIR = path.dirname(argv.target)
  const TARGET_EXT = argv.target.split('.').pop()
  const TARGET_FILE_NAME = path.basename(argv.target, `.${TARGET_EXT}`)

  if ('wasm' !== TARGET_EXT) {
    throw new Error(`Unsupported target ${TARGET_EXT}, make sure target ends with .wasm`)
  }

  const ROLLUP_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.js`
  const QJSC_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.h`
  const CONTRACT_TARGET = `${TARGET_DIR}/${TARGET_FILE_NAME}.wasm`

  console.log(`Building ${SOURCE_FILE_WITH_PATH} contract...`)

  if (SOURCE_EXT === 'ts') {
    await checkTsBuildWithTsc(SOURCE_FILE_WITH_PATH)
  }

  console.log(`Creating ${TARGET_DIR} directory...`)
  await executeCommand(`mkdir -p ${TARGET_DIR}`)

  await createJsFileWithRullup(SOURCE_FILE_WITH_PATH, ROLLUP_TARGET)

  await createHeaderFileWithQjsc(ROLLUP_TARGET, QJSC_TARGET)

  await createMethodsHeaderFile(ROLLUP_TARGET)
  await createWasmContract(QJSC_TARGET, CONTRACT_TARGET)
  await wasiStubContract(CONTRACT_TARGET)
}

async function checkTsBuildWithTsc(sourceFileWithPath) {
  console.log(`check TypeScript build of ${sourceFileWithPath} with tsc`)
  await executeCommand(
    `${TSC} --noEmit --experimentalDecorators --target es2020 --moduleResolution node ${sourceFileWithPath}`
  )
}

// Common build function
async function createJsFileWithRullup(sourceFileWithPath, rollupTarget) {
  console.log(`Creating ${rollupTarget} file with Rollup...`)
  const bundle = await rollup({
    input: sourceFileWithPath,
    plugins: [
      nodeResolve({
        extensions: ['.js', '.ts'],
      }),
      sourcemaps(),
      // commonjs(),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.js', '.jsx', '.es6', '.es', '.mjs'],
      }),
    ],
  })

  await bundle.write({
    sourcemap: true,
    file: rollupTarget,
    format: 'es',
  })
}

async function createHeaderFileWithQjsc(rollupTarget, qjscTarget) {
  console.log(`Creating ${qjscTarget} file with QJSC...`)
  await executeCommand(`${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`)
}

async function createMethodsHeaderFile(rollupTarget) {
  console.log(`Genereting methods.h file`)

  const source = rollupTarget
  const buildPath = path.dirname(source)

  console.log(rollupTarget)

  const mod = await import(`${PROJECT_DIR}/${rollupTarget}`)
  const exportNames = Object.keys(mod)
  const methods = exportNames.reduce((result, key) => `${result}DEFINE_NEAR_METHOD(${key})\n`, '')

  await fs.writeFile(`${buildPath}/methods.h`, methods)
}

async function createWasmContract(qjscTarget, contractTarget) {
  console.log(`Creating ${contractTarget} contract...`)
  const WASI_SDK_PATH = `${NEAR_SDK_JS}/cli/deps/wasi-sdk`

  const CC = `${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot`
  let DEFS = `-D_GNU_SOURCE '-DCONFIG_VERSION="2021-03-27"' -DCONFIG_BIGNUM`

  if (process.env.NEAR_NIGHTLY) {
    DEFS = DEFS + ' -DNIGHTLY'
  }

  const INCLUDES = `-I${QJSC_DIR} -I.`
  const ORIGINAL_BUILDER_PATH = `${NEAR_SDK_JS}/cli/builder/builder.c`
  const NEW_BUILDER_PATH = `${path.dirname(contractTarget)}/builder.c`
  const SOURCES = `${NEW_BUILDER_PATH} ${QJSC_DIR}/quickjs.c ${QJSC_DIR}/libregexp.c ${QJSC_DIR}/libunicode.c ${QJSC_DIR}/cutils.c ${QJSC_DIR}/quickjs-libc-min.c ${QJSC_DIR}/libbf.c`
  const LIBS = `-lm`

  // copying builder.c file to the build folder
  await executeCommand(`cp ${ORIGINAL_BUILDER_PATH} ${NEW_BUILDER_PATH}`)
  await executeCommand(`mv ${qjscTarget} build/code.h`)

  await executeCommand(
    `${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=${
      256 * 1024
    } -Wl,--lto-O3 -o ${contractTarget}`
  )
}

async function wasiStubContract(contractTarget) {
  console.log(`Executing wasi-stub...`)
  const WASI_STUB = `${NEAR_SDK_JS}/cli/deps/binaryen/wasi-stub/run.sh`
  await executeCommand(`${WASI_STUB} ${contractTarget} >/dev/null`)
}
