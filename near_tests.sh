#!/bin/bash

set -euo pipefail

runner=$HOME/workspace/nearcore/target/debug/near-vm-runner-standalone

function test {
    output=$($runner --wasm-file near_tests.wasm --method-name test_$1)
    grep -q 'err: None' <<< $output
}

test account_balance