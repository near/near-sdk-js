#!/bin/bash
set -exuo pipefail

MAJOR_VER=11
MINOR_VER=0
VERSION=${MAJOR_VER}.${MINOR_VER}

# Download WASI SDK for all supported platforms
for SYSTEM in Linux Darwin; do

    if [ "${SYSTEM}" = "Linux" ]; then
        SYSTEM_NAME=linux
    elif [ "${SYSTEM}" = "Darwin" ]; then
        SYSTEM_NAME=macos
    else
        echo "Unsupported system ${SYSTEM}"
        exit 1
    fi

    TAR_NAME=wasi-sdk-"${VERSION}"-"${SYSTEM_NAME}".tar.gz
    EXTRACTED_WASI_SDK_FOLDER=wasi-sdk-"${VERSION}"
    TARGET_WASI_SDK_FOLDER="${SYSTEM}"

    # Delete the old wasi-sdk folder if it exists
    rm -rf "${TARGET_WASI_SDK_FOLDER}"

    # Download WASI SDK
    wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/"${TAR_NAME}"

    # Extract WASI SDK
    tar xvf "${TAR_NAME}"

    # Rename folder WASI SDK folder, cleanup
    cp -r "${EXTRACTED_WASI_SDK_FOLDER}" "${TARGET_WASI_SDK_FOLDER}"
    rm -rf "${EXTRACTED_WASI_SDK_FOLDER}"
    rm "${TAR_NAME}"

done
