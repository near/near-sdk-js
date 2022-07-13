#!/bin/bash
set -exuo pipefail

# Delete binaryen and build artifacts from previous runs.
rm -rf binaryen
rm -rf bin

# Clone the binaryen repository.
git clone --branch wasi-stub --single-branch https://github.com/near/binaryen

# Build the binaryen repository.
cd binaryen
cmake . && make
cd wasi-stub
./build.sh
cd ../..

# Copy build artifacts to bin directory.
mkdir -p bin
cp binaryen/wasi-stub/wasi-stub ../artifacts/binaryen
cp binaryen/lib/libbinaryen.so ../artifacts/binaryen
