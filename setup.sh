#!/bin/bash
set -exuo pipefail

rm -rf vendor
mkdir vendor
cd vendor
# binaryen
git clone --branch wasi-stub --single-branch https://github.com/near/binaryen
cd binaryen
cmake . && make
cd wasi-stub
./build.sh
