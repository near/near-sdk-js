#!/bin/bash

set -euo pipefail

runner=$HOME/workspace/nearcore/target/debug/near-vm-runner-standalone

function test {
    output=$($runner --wasm-file near_tests.wasm --method-name test_$1 ${@: 2})
    if grep -q 'err: None' <<< $output; then
        echo test_$1 OK
    else
        echo test_$1 FAILED
        $runner --wasm-file near_tests.wasm --method-name test_$1 ${@: 2}
    fi
}

test register
test current_account_id
test signer_account_id
test signer_account_pk
test predecessor_account_id
test input --input aaaa
test block_index
test block_timestamp
test epoch_height
test storage_usage
test account_balance
test account_locked_balance
test attached_deposit
test prepaid_gas
test used_gas
test sha256
test keccak256
test keccak512
test ripemd160
test ecrecover
test log
test promise_create
test promise_then
test promise_and
test promise_batch_create
test promise_batch_then