#!/bin/bash
set -euo pipefail

mkdir -p build
rollup -c
cd build
../node_modules/near-sdk-js/contract-builder/builder.sh on-call.js
