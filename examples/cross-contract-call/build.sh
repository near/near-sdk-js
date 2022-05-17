#!/bin/bash
set -euo pipefail

mkdir -p build
rollup -c
cd build
cp ../../../jsvm/jsvm.wasm .
../../../contract-builder/builder.sh on-call.js
