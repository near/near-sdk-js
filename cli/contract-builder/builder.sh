#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
QJSC=${SCRIPT_DIR}/../res/qjsc
TEMP=$(basename ${1%.*}).h
TARGET=$(basename ${1%.*}).base64

echo 'SCRIPT_DIR'
echo ${SCRIPT_DIR}
echo 'QJSC'
echo ${QJSC}
echo 'TEMP'
echo ${TEMP}
echo 'TARGET'
echo ${TARGET}
echo '1'
echo $1

echo "excuting QJSC"
${QJSC} -c -m -o ${TEMP} -N code $1
echo "Saving bytecode..."
node ${SCRIPT_DIR}/save_bytecode.js ${TEMP} ${TARGET}
rm ${TEMP}
