#!/bin/bash
set -euo pipefail

mkdir -p vendor
cd vendor
# wasi-sdk
wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/wasi-sdk-11.0-linux.tar.gz
tar xvf wasi-sdk-11.0-linux.tar.gz

cd ../quickjs
make qjsc
cd ..