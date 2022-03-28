#!/bin/bash
set -euo pipefail

mkdir -p build
rollup -c
cd build
../../../builder.sh template.js
