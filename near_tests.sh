#!/bin/bash

set -euo pipefail

runner_default=$HOME/workspace/nearcore/target/debug/near-vm-runner-standalone
runner=${NEAR_VM_RUNNER_STANDALONE:-${runner_default}}
mkdir -p build
cd build
../builder.sh ../tests/near_tests.js

function test {
    output=$($runner --wasm-file near_tests.wasm --method-name test_$1 ${@: 2})
    if grep -q 'err: None' <<< $output; then
        echo test_$1 OK
    else
        echo test_$1 FAILED
        $runner --wasm-file near_tests.wasm --method-name test_$1 ${@: 2}
        exit 1
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
test promise_batch_action_create_account
test promise_batch_action_deploy_contract
test promise_batch_action_function_call
test promise_batch_action_transfer
test promise_batch_action_stake
test promise_batch_action_add_key_with_full_access
test promise_batch_action_add_key_with_function_call
test promise_batch_action_delete_key
test promise_batch_action_delete_account
test promise_results_count 
test promise_result --promise-results '{"Successful":"abc"}' 
test promise_return 
test storage_access
test validator_stake
test validator_total_stake
test alt_bn128_g1_multiexp
test alt_bn128_g1_sum
test alt_bn128_pairing_check
