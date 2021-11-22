#!/bin/bash
make qjsc
./qjsc examples/counter.js -c -o code.h -N code
./qjsc examples/call_decrement.js -c -o call_decrement_code.h
./qjsc examples/call_increment.js -c -o call_increment_code.h
./qjsc examples/call_reset.js -c -o call_reset_code.h
./qjsc examples/call_get_num.js -c -o call_get_num_code.h

defs='-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM'
sources='builder.c quickjs.c libregexp.c libunicode.c cutils.c quickjs-libc-min.c libbf.c'
libs='-lm'
includes="-Istubs"

# clang --target=wasm32 \
clang --target=wasm32-unknown-wasi \
    --sysroot $HOME/Downloads/pkg/wasi-libc \
    -nostartfiles -Os \
    ${defs} ${includes} ${sources} ${libs} \
    -Wl,--no-entry \
    -Wl,--export-all \
    -Wl,--allow-undefined \
    -Wl,-z,stack-size=$[256 * 1024] \
    -o counter.wasm