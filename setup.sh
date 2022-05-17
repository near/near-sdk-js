#!/bin/bash
set -exuo pipefail

# install SDK dependencies
cd sdk && yarn && cd ..

# prepare QuickJS
cd quickjs && ./build.sh && cd ..

# Prepare JSVM contract
cd jsvm && ./setup.sh && ./build.sh && cd ..