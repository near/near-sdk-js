#!/bin/bash
set -euo pipefail

mkdir -p build
rollup -c
cd build
cp ../../../jsvm.wasm .
../../../builder.sh on-call.js
