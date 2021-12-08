#!/bin/bash
make qjsc
./qjsc examples/near_tests.js -c -o code.h -N code

cat <<EOF > methods.h
DEFINE_NEAR_METHOD(test_account_balance)
DEFINE_NEAR_METHOD(test_account_locked_balance)
DEFINE_NEAR_METHOD(test_attached_deposit)
DEFINE_NEAR_METHOD(test_prepaid_gas)
DEFINE_NEAR_METHOD(test_used_gas)

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
    -o near_tests.wasm