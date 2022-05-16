#!/bin/bash
set -euo pipefail

rm -rf vendor
mkdir vendor
cd vendor
# wasi-sdk
SYSTEM=$(uname)
if [ "${SYSTEM}" = "Linux" ]; then
    system=linux
elif [ "${SYSTEM}" = "Darwin" ]; then
    system=macos
else
    echo "Unsupported system ${SYSTEM}"
    exit 1
fi
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/wasi-sdk-11.0-"${system}".tar.gz
tar xvf wasi-sdk-11.0-"${system}".tar.gz
# binaryen
git clone --branch wasi-stub --single-branch https://github.com/near/binaryen
cd binaryen
cmake . && make
cd wasi-stub
./build.sh
cd ../../..

cd quickjs
make qjsc
cd ..
