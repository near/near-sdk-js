#!/bin/bash
set -euo pipefail

make qjsc
./qjsc examples/bignum.js -c -o code.h -N code

cat <<EOF > methods.h
DEFINE_NEAR_METHOD(balance)
EOF

defs='-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM'
sources='builder.c quickjs.c libregexp.c libunicode.c cutils.c quickjs-libc-min.c libbf.c'
libs='-lm'
includes="-Istubs"

# clang --target=wasm32 \
clang --target=wasm32-unknown-wasi \
    --sysroot $HOME/Downloads/pkg/wasi-libc \
    -nostartfiles -Oz \
    ${defs} ${includes} ${sources} ${libs} \
    -Wl,--no-entry \
    -Wl,--export-all \
    -Wl,--allow-undefined \
    -Wl,-z,stack-size=$[256 * 1024] \
    -o bignum.wasm