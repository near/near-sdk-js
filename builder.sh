#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
WASI_SDK_PATH=${SCRIPT_DIR}/vendor/wasi-sdk-11.0
CC="${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot"
QUICKJS_SRC_DIR=${SCRIPT_DIR}/quickjs
QJSC=${QUICKJS_SRC_DIR}/qjsc
WASI_STUB=${SCRIPT_DIR}/vendor/binaryen/wasi-stub/run.sh
TARGET=$(basename ${1%.*}).wasm

rm -f ${TARGET}
${QJSC} $1 -c -m -o code.h -N code

node ${SCRIPT_DIR}/codegen.js $1

DEFS='-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM'
INCLUDES="-I${SCRIPT_DIR}/stubs -I${QUICKJS_SRC_DIR} -I."
LIBS='-lm'
QUICKJS_SOURCES=(quickjs.c libregexp.c libunicode.c cutils.c quickjs-libc-min.c libbf.c)
SOURCES="${SCRIPT_DIR}/builder.c"

for i in "${QUICKJS_SOURCES[@]}"; do 
  SOURCES="${SOURCES} ${QUICKJS_SRC_DIR}/${i}"
done

$CC --target=wasm32-wasi \
    -nostartfiles -Oz \
    ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} \
    -Wl,--no-entry \
    -Wl,--export-all \
    -Wl,--allow-undefined \
    -Wl,-z,stack-size=$[256 * 1024] \
    -o ${TARGET}

rm code.h methods.h
${WASI_STUB} ${TARGET} >/dev/null
