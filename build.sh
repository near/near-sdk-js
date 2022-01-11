#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
WASI_SDK_PATH=${SCRIPT_DIR}/vendor/wasi-sdk-11.0
CC="${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"
QUICKJS_SRC_DIR=${SCRIPT_DIR}/quickjs
WASI_STUB=${SCRIPT_DIR}/vendor/binaryen/wasi-stub/run.sh

DEFS='-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM'
if [ -v NEAR_NIGHTLY ]; then
  DEFS+=' -DNIGHTLY'
fi
INCLUDES="-I${SCRIPT_DIR}/stubs -I${QUICKJS_SRC_DIR} -I."
LIBS='-lm'
QUICKJS_SOURCES=(quickjs.c libregexp.c libunicode.c cutils.c quickjs-libc-min.c libbf.c)
SOURCES="${SCRIPT_DIR}/jsvm.c"

for i in "${QUICKJS_SOURCES[@]}"; do 
  SOURCES="${SOURCES} ${QUICKJS_SRC_DIR}/${i}"
done

$CC --target=wasm32-wasi \
    -nostartfiles -Oz -flto \
    ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} \
    -Wl,--no-entry \
    -Wl,--allow-undefined \
    -Wl,-z,stack-size=$[256 * 1024] \
    -Wl,--lto-O3 \
    -o jsvm.wasm

${WASI_STUB} jsvm.wasm >/dev/null
