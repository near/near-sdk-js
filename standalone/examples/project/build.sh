#!/bin/bash
mkdir -p build
yarn rollup -c
cd build
../../../builder.sh project.js
