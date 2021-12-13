QuickJS
=======
The main documentation is in doc/quickjs.pdf or doc/quickjs.html.

Build contract for NEAR
=======================

Prerequisites
-------------

- Ubuntu 20.04
- gcc
- make
- clang and llvm
- wasi-sdk 11: https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/wasi-sdk-11.0-linux.tar.gz
- wasi-libc: https://github.com/WebAssembly/wasi-libc.git, place it in ~/Downloads/pkg/wasi-libc


Steps
-----
1. Uncompress wasi-sdk, find lib/clang/10.0.0/lib/wasi/libclang_rt.builtins-wasm32.a and place it in
 /usr/lib/llvm-10/lib/clang/10.0.0/lib/wasi/libclang_rt.builtins-wasm32.a

2. ./build_counter.sh. move the built counter.wasm to nearcore.

3. Go to nearcore, near-sdk-js branch, build near-vm-runner-standalone and run:
```
target/debug/near-vm-runner-standalone --method-name get_num --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name increment --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name reset --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name decrement --wasm-file counter.wasm --state '{"YQ==":"MA=="}'
```

4. Alternatively, run a local node, deploy and call methods:
```
quickjs (near-sdk-js) export NEAR_ENV=local
quickjs (near-sdk-js) near deploy test.near counter.wasm 
Starting deployment. Account id: test.near, node: http://localhost:3030, helper: http://localhost:3000, file: counter.wasm
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Transaction Id WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
Done deploying to test.near

quickjs (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: m2oWjsWUdr1AdP2AVB8snnK3PRGNgu9sQJVMuYcbmar
        Log [test.near]: Increased number to 1
Transaction Id 6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
''

quickjs (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: Ez8yqQgNiX7sNg3hRYdu6pAGsuvPqd2z5JFacKmnTErg
        Log [test.near]: Increased number to 2
Transaction Id 5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
''

quickjs (near-sdk-js) near view test.near get_num --accountId test.near --args ''
View call: test.near.get_num()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
2

```

NEAR-SDK-JS Low Level API Reference
=========================

Use `env.func_name(args)` to call low level APIs in JavaScript contracts. `env` is already imported before contract start. For example, `env.read_register(0)`.

About Type 
----------

- In arguments, `Uint64: Number | BigInt`. In return, `Uint64: BigInt`. Because JavaScript Number cannot hold all Uint64 without losing precision. But as arguments, interger number is also allowed for convinience. Same for `Uint128`.
- `String` in both arguments and return is a byte buffer encoded as a JavaScript String. Which means:
    - If the string have only 1 byte chars, the representation is same.
    - If the string have 2/3/4 byte char, it is break down to 2/3/4 bytes and each byte as a separate char.
    - Arbitrary binary data `0x00-0xff` is as the char '\x00-\xff'

It's intentional to represent string and bytes in this way because QuickJS doesn't have ArrayBuffer in C API.

- The signature may differs from Rust APIs. This is because JavaScript doesn't have pointers and not possible to pass pointer as arguments. So, Instead of `data_len: u64, data_ptr: u64`, JavaScript API pass the data directly: `data: String`.
- The lowest level Rust API cannot return value bigger than 64 bit integer. So some of the API pass pointer as Uint64 and the Rust function write return data at the location specified by pointer. In JavaScript we don't have this limitation and value is returned as API function return.

Registers API
-------------
```
function read_register(register_id: Uint64): String;
function register_len(register_id: Uint64): Uint64;
function write_register(register_id: Uint64, data: String);
```

Context API
-----------
```
function current_account_id(register_id: Uint64);
function signer_account_id(register_id: Uint64);
function signer_account_pk(register_id: Uint64);
function predecessor_account_id(register_id: Uint64);
function input(register_id: Uint64);
function block_index(): Uint64;
function block_timestamp(): Uint64;
function epoch_height(): Uint64;
function storage_usage(): Uint64;
```

Economics API
-------------
```
function account_balance(): Uint128;
function account_locked_balance(): Uint128;
function attached_deposit(): Uint128;
function prepaid_gas(): Uint64;
function used_gas(): Uint64;
```

Math API
--------

```
function random_seed(register_id: Uint64);
function sha256(value: String, register_id: Uint64);
function keccak256(value: String, register_id: Uint64);
function keccak512(value: String, register_id: Uint64);
function ripemd160(value: String, register_id: Uint64);
function ecrecover(hash: String, sign: String, v: Uint64, malleability_flag: Uint64, register_id: Uint64): Uint64;
```

Miscellaneous API
-----------------

```
function value_return(value: String);
function panic(msg?: String);
function panic_utf8(msg: String);
function log(msg: String);
function log_utf8(msg: String);
function log_utf16(msg: String);
// Name confliction with WASI. Can be re-exported with a different name on NEAR side with a protocol upgrade
// Or, this is actually not a primitive, can be implement with log and panic host functions in C side or JS side. 
// function abort(msg_ptr: Uint32, filename_ptr: Uint32, u32: Uint32, col: Uint32);
```

Promises API

```
function promise_create(account_id: String, method_name: String, arguments: String, amount: Uint128, gas: Uint64): Uint64;
function promise_then(promise_index: Uint64, account_id: String, method_name: String, arguments: String, amount: Uint128, gas: Uint64): Uint64;
function promise_and(...promise_idx: Uint64): Uint64;
function promise_batch_create(account_id: String): Uint64;
function promise_batch_then(promise_index: Uint64, account_id: String): Uint64;
```

Promise API actions
-------------------
```
function promise_batch_action_create_account(promise_index: Uint64);
function promise_batch_action_deploy_contract(promise_index: Uint64, code: String);
function promise_batch_action_function_call(promise_index: Uint64, method_name: String, arguments: String, amount: Uint128, gas: Uint64);
function promise_batch_action_transfer(promise_index: Uint64, amount: Uint128);
function promise_batch_action_stake(promise_index: Uint64, amount: Uint128, public_key: String);
function promise_batch_action_add_key_with_full_access(promise_index: Uint64, public_key: String, nonce: Uint64);
function promise_batch_action_add_key_with_function_call(promise_index: Uint64, public_key: String, nonce: Uint64, allowance: Uint128, receiver_id: String, method_names: String);
function promise_batch_action_delete_key(promise_index: Uint64, public_key: String);
function promise_batch_action_delete_account(promise_index: Uint64, beneficiary_id: String);
```

Promise API results
-------------------
```
function promise_results_count(void): Uint64;
function promise_result(result_idx: Uint64, register_id: Uint64): Uint64;
function promise_return(promise_idx: Uint64);
```

Storage API
-----------
```
function storage_write(key: String, value: String, register_id: Uint64): Uint64;
function storage_read(key: String, register_id: Uint64): Uint64;
function storage_remove(key: String, register_id: Uint64): Uint64;
function storage_has_key(key: String): Uint64;
```

Validator API
-------------
```
function validator_stake(account_id: String): Uint128;
function validator_total_stake(): Uint128;
```

Alt BN128
---------
```
function alt_bn128_g1_multiexp(value: String, register_id: Uint64);
function alt_bn128_g1_sum(value: String, register_id: Uint64);
function alt_bn128_pairing_check(value: String): Uint64;
```