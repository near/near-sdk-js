#!/bin/bash
mkdir -p build
rollup -c
cd build
../../../builder.sh project.js
