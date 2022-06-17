# NEAR-SDK-JS (Standalone)

## Installation
It is tested on Ubuntu 20.04 and Intel Mac. Other linux and M1 Mac with rosetta should also work but they're not tested.

1. Make sure you have make, cmake and nodejs. On Linux, also make sure you have gcc.
2. `make setup`

## Usage

1. Write smart contracts with JavaScript. You can use most npm packages that uses portable ES2020 features. Export callable contract methods with export. See `examples/` for examples.
2. Build the contract with `path/to/near-sdk-js/builder.sh path/to/your/<contract-name>.js`.
3. If no errors happens, a `<contract-name>.wasm` will be generate at current directory. You can test it with local neard or testnet.

## Demo

### On a local node

1. Build the contract
```
mkdir -p build
cd build
../standalone/builder.sh ../standalone/examples/counter.js
```

2. Go to nearcore, Build and start a local node
```
cargo build -p neard
target/debug/neard init
target/debug/neard run
```

3. Have `near-cli` installed. Deploy and call method in the contract. Example session:
```
nearcore (near-sdk-js) export NEAR_ENV=local
nearcore (near-sdk-js) near deploy test.near counter.wasm 
Starting deployment. Account id: test.near, node: http://localhost:3030, helper: http://localhost:3000, file: counter.wasm
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Transaction Id WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
Done deploying to test.near

nearcore (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: m2oWjsWUdr1AdP2AVB8snnK3PRGNgu9sQJVMuYcbmar
        Log [test.near]: Increased number to 1
Transaction Id 6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
''

nearcore (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: Ez8yqQgNiX7sNg3hRYdu6pAGsuvPqd2z5JFacKmnTErg
        Log [test.near]: Increased number to 2
Transaction Id 5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
''

nearcore (near-sdk-js) near view test.near get_num --accountId test.near --args ''
View call: test.near.get_num()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
2

```

### On testnet
The following shows a session to build, deploy and call a contract on testnet:

```
near-sdk-js (master) export NEAR_ENV=testnet

near-sdk-js (master) ./builder.sh examples/nft.js 

near-sdk-js (master) near dev-deploy nft.wasm 
Starting deployment. Account id: dev-1641453759104-17291726737196, node: https://rpc.testnet.near.org, helper: https://helper.testnet.near.org, file: nft.wasm
Transaction Id 7vxUnEg7XNjtBVxjgo1YvHnx9f6bzeTwWktDoQgaQzho
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/7vxUnEg7XNjtBVxjgo1YvHnx9f6bzeTwWktDoQgaQzho
Done deploying to dev-1641453759104-17291726737196

near-sdk-js (master) near call dev-1641453759104-17291726737196 mint_to --accountId dev-1641453759104-17291726737196 --args '{"owner":"abcdef.testnet"}'
Scheduling a call: dev-1641453759104-17291726737196.mint_to({"owner":"abcdef.testnet"})
Doing account.functionCall()
Receipt: 7ouVxQnzFDqM9rasLVnDGfMFYPR42ZJ3Vh1z81Eb3d4C
        Log [dev-1641453759104-17291726737196]: Minted NFT 1 to abcdef.testnet
Transaction Id 3Fa6k2kGabBt9CafGkukgovJRaq29pAN4Vc6YafhjuiY
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/3Fa6k2kGabBt9CafGkukgovJRaq29pAN4Vc6YafhjuiY
1
```

## NEAR-SDK-JS Low Level API Reference

Use `env.func_name(args)` to call low level APIs in JavaScript contracts. `env` is already imported before contract start. For example, `env.read_register(0)`.
To use nightly host functions, such as `alt_bn128_g1_sum`, build the contract with `NEAR_NIGHTLY=1 path/to/near-sdk-js/builder.sh path/to/contract.js`.

### About Type 

- In arguments, `Uint64: Number | BigInt`. In return, `Uint64: BigInt`. Because JavaScript Number cannot hold all Uint64 without losing precision. But as arguments, interger number is also allowed for convinience. Same for `Uint128`.
- `String` in both arguments and return is a byte buffer encoded as a JavaScript String. Which means:
    - If the string have only 1 byte chars, the representation is same.
    - If the string have 2/3/4 byte char, it is break down to 2/3/4 bytes and each byte as a separate char.
    - Arbitrary binary data `0x00-0xff` is as the char '\x00-\xff'

It's intentional to represent string and bytes in this way because QuickJS doesn't have ArrayBuffer in C API.

- The signature may differs from Rust APIs. This is because JavaScript doesn't have pointers and not possible to pass pointer as arguments. So, Instead of `data_len: u64, data_ptr: u64`, JavaScript API pass the data directly: `data: String`.
- The lowest level Rust API cannot return value bigger than 64 bit integer. So some of the API pass pointer as Uint64 and the Rust function write return data at the location specified by pointer. In JavaScript we don't have this limitation and value is returned as API function return.

### Registers API

```
function read_register(register_id: Uint64): String;
function register_len(register_id: Uint64): Uint64;
function write_register(register_id: Uint64, data: String);
```

### Context API

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

### Economics API
```
function account_balance(): Uint128;
function account_locked_balance(): Uint128;
function attached_deposit(): Uint128;
function prepaid_gas(): Uint64;
function used_gas(): Uint64;
```

### Math API


```
function random_seed(register_id: Uint64);
function sha256(value: String, register_id: Uint64);
function keccak256(value: String, register_id: Uint64);
function keccak512(value: String, register_id: Uint64);
function ripemd160(value: String, register_id: Uint64);
function ecrecover(hash: String, sign: String, v: Uint64, malleability_flag: Uint64, register_id: Uint64): Uint64;
```

### Miscellaneous API


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

### Promises API

```
function promise_create(account_id: String, method_name: String, arguments: String, amount: Uint128, gas: Uint64): Uint64;
function promise_then(promise_index: Uint64, account_id: String, method_name: String, arguments: String, amount: Uint128, gas: Uint64): Uint64;
function promise_and(...promise_idx: Uint64): Uint64;
function promise_batch_create(account_id: String): Uint64;
function promise_batch_then(promise_index: Uint64, account_id: String): Uint64;
```

### Promise API actions

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

### Promise API results

```
function promise_results_count(void): Uint64;
function promise_result(result_idx: Uint64, register_id: Uint64): Uint64;
function promise_return(promise_idx: Uint64);
```

### Storage API

```
function storage_write(key: String, value: String, register_id: Uint64): Uint64;
function storage_read(key: String, register_id: Uint64): Uint64;
function storage_remove(key: String, register_id: Uint64): Uint64;
function storage_has_key(key: String): Uint64;
```

### Validator API

```
function validator_stake(account_id: String): Uint128;
function validator_total_stake(): Uint128;
```

### Alt BN128

```
function alt_bn128_g1_multiexp(value: String, register_id: Uint64);
function alt_bn128_g1_sum(value: String, register_id: Uint64);
function alt_bn128_pairing_check(value: String): Uint64;
```

## Error Handling in NEAR-SDK-JS

### Error handling behavior

- when js throws an error, uncatched, then transaction fails with GuestPanic error, with the user js error message and stacktrace
- when call host function with inappropriate type, means incorrect number of arguments or arg is not expected type:
    - if arguments less than params, remaining argument are set as 'undefined'
    - if arguments more than params, remaining argument are ignored
    - if argument is different than the required type, it'll be coerced to required type
    - if argument is different than the required type but cannot be coerced, will throw runtime type error, also with message and stacktrace

### The error reporting capability of a wasm contract
Smart contract can only use `panic` or `panic_utf8` to abort from execution. That is of error kind `GuestPanic {msg}`. It displays in RPC as `"Smart contract panicked: {msg}"`
And only `panic_utf8` can set that message. 
Other than this, if calls a host function, it can returns error provided by that host function. For example, any host function can return a `GasExceeded`. `log_utf8` can return `BadUTF8`. This behavior is part of protocol and we cannot control or trigger in JavaScript (without calling `env.*`). 

### Use errors
You can throw an error in JavaScript. Our quickjs runtime will detect and automatically invoke `panic_utf8` with `"{error.message}\n:{error.stack}"`. As a result, transaction will fail with `"Smart contract panicked: {error.message}\n{error.stack}"` error message.

### Use verror
User can use verror this way:
1. catch an error, attach information to it
2. return/rethrow the error, attach more information to it
3. throw the final verror, `throw e`, same as in nodejs.

Under the hood, our quickjs runtime would take the final throwed error, and invoke panic_utf8("{error.message}\n{error.stack}")

## TODO
- Other c functions are exposed and can be name confliction with bindgen functions. Need binaryen pass to rename c functions
- Source maps for rollup build to correctly display locations in the backtrace
