#!/bin/bash
set -euo pipefail

mkdir -p build
rollup -c
cd build
../../../contract-builder/builder.sh project.js
