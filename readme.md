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

```
// #################
// # Economics API #
// #################
extern void account_balance(uint64_t balance_ptr);
extern void account_locked_balance(uint64_t balance_ptr);
extern void attached_deposit(uint64_t balance_ptr);
extern uint64_t prepaid_gas();
extern uint64_t used_gas();
// ############
// # Math API #
// ############
extern void random_seed(uint64_t register_id);
extern void sha256(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void keccak256(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void keccak512(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void ripemd160(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t ecrecover(uint64_t hash_len, uint64_t hash_ptr, uint64_t sign_len, uint64_t sig_ptr, uint64_t v, uint64_t malleability_flag, uint64_t register_id);
// #####################
// # Miscellaneous API #
// #####################
extern void value_return(uint64_t value_len, uint64_t value_ptr);
extern void panic(void);
extern void panic_utf8(uint64_t len, uint64_t ptr);
extern void log_utf8(uint64_t len, uint64_t ptr);
extern void log_utf16(uint64_t len, uint64_t ptr);
// Name confliction with WASI. Can be re-exported with a different name on NEAR side with a protocol upgrade
// Or, this is actually not a primitive, can be implement with log and panic host functions in C side or JS side. 
// extern void abort(uint32_t msg_ptr, uint32_t filename_ptr, uint32_t u32, uint32_t col);
// ################
// # Promises API #
// ################
extern uint64_t promise_create(uint64_t account_id_len, uint64_t account_id_ptr, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern uint64_t promise_then(uint64_t promise_index, uint64_t account_id_len, uint64_t account_id_ptr, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern uint64_t promise_and(uint64_t promise_idx_ptr, uint64_t promise_idx_count);
extern uint64_t promise_batch_create(uint64_t account_id_len, uint64_t account_id_ptr);
extern uint64_t promise_batch_then(uint64_t promise_index, uint64_t account_id_len, uint64_t account_id_ptr);
// #######################
// # Promise API actions #
// #######################
extern void promise_batch_action_create_account(uint64_t promise_index);
extern void promise_batch_action_deploy_contract(uint64_t promise_index, uint64_t code_len, uint64_t code_ptr);
extern void promise_batch_action_function_call(uint64_t promise_index, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern void promise_batch_action_transfer(uint64_t promise_index, uint64_t amount_ptr);
extern void promise_batch_action_stake(uint64_t promise_index, uint64_t amount_ptr, uint64_t public_key_len, uint64_t public_key_ptr);
extern void promise_batch_action_add_key_with_full_access(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr, uint64_t nonce);
extern void promise_batch_action_add_key_with_function_call(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr, uint64_t nonce, uint64_t allowance_ptr, uint64_t receiver_id_len, uint64_t receiver_id_ptr, uint64_t method_names_len, uint64_t method_names_ptr);
extern void promise_batch_action_delete_key(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr);
extern void promise_batch_action_delete_account(uint64_t promise_index, uint64_t beneficiary_id_len, uint64_t beneficiary_id_ptr);
// #######################
// # Promise API results #
// #######################
extern uint64_t promise_results_count(void);
extern uint64_t promise_result(uint64_t result_idx, uint64_t register_id);
extern void promise_return(uint64_t promise_idx);
// ###############
// # Storage API #
// ###############
extern uint64_t storage_write(uint64_t key_len, uint64_t key_ptr, uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t storage_read(uint64_t key_len, uint64_t key_ptr, uint64_t register_id);
extern uint64_t storage_remove(uint64_t key_len, uint64_t key_ptr, uint64_t register_id);
extern uint64_t storage_has_key(uint64_t key_len, uint64_t key_ptr);
extern uint64_t storage_iter_prefix(uint64_t prefix_len, uint64_t prefix_ptr);
extern uint64_t storage_iter_range(uint64_t start_len, uint64_t start_ptr, uint64_t end_len, uint64_t end_ptr);
extern uint64_t storage_iter_next(uint64_t iterator_id, uint64_t key_register_id, uint64_t value_register_id);
// #################
// # Validator API #
// #################
extern void validator_stake(uint64_t account_id_len, uint64_t account_id_ptr, uint64_t stake_ptr);
extern void validator_total_stake(uint64_t stake_ptr);
// #############
// # Alt BN128 #
// #############
extern void alt_bn128_g1_multiexp(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void alt_bn128_g1_sum(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t alt_bn128_pairing_check(uint64_t value_len, uint64_t value_ptr);
```