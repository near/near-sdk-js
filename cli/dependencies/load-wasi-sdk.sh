#!/bin/bash
set -exuo pipefail

MAJOR_VER=11
MINOR_VER=0
VERSION=${MAJOR_VER}.${MINOR_VER}

SYSTEM=$(uname)
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
TARGET_WASI_SDK_FOLDER=wasi-sdk-"${SYSTEM}"

rm -rf "${TARGET_WASI_SDK_FOLDER}"

wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/"${TAR_NAME}"
tar xvf "${TAR_NAME}"

cp -r "${EXTRACTED_WASI_SDK_FOLDER}" "${TARGET_WASI_SDK_FOLDER}"
rm -rf "${EXTRACTED_WASI_SDK_FOLDER}"
rm "${TAR_NAME}"
