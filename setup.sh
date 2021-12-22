#!/bin/bash
set -euo pipefail

rm -rf vendor
mkdir vendor
cd vendor
# wasi-sdk
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/wasi-sdk-11.0-linux.tar.gz
tar xvf wasi-sdk-11.0-linux.tar.gz
# binaryen
git clone --branch wasi-stub --single-branch https://github.com/near/binaryen
cd binaryen
cmake . && make -j
cd wasi-stub
./build.sh
cd ../../..

cd quickjs
make qjsc
cd ..
