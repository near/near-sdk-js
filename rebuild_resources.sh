#!/bin/bash
set -exuo pipefail

# Build and copy QuickJS
cd quickjs && ./build.sh && cd ..
cp quickjs/qjsc res/qjsc

# Build and copy JSVM contract
cd jsvm && ./setup.sh && ./build.sh && cd ..
cp jsvm/jsvm.wasm res/jsvm.wasm