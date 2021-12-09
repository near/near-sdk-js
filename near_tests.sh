#!/bin/bash

set -euo pipefail

runner=$HOME/workspace/nearcore/target/debug/near-vm-runner-standalone

function test {
    output=$($runner --wasm-file near_tests.wasm --method-name test_$1)
    if grep -q 'err: None' <<< $output; then
        echo test_$1 OK
    else
        echo test_$1 FAILED
        $runner --wasm-file near_tests.wasm --method-name test_$1
    fi
}

test account_balance
test account_locked_balance
test attached_deposit
test prepaid_gas
test used_gas
test register