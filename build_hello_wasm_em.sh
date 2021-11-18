#!/bin/bash
make qjsc
./qjsc examples/hello.js -e -o hello.c
defs='-D_GNU_SOURCE -DCONFIG_VERSION="2021-03-27" -DCONFIG_BIGNUM'
emcc ${defs} -Os -o hello.js hello.c quickjs.c libregexp.c libunicode.c cutils.c quickjs-libc.c libbf.c -lm -ldl -lpthread