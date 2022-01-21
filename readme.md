# NEAR-SDK-JS (Enclave)

## Installation
It is tested on Ubuntu 20.04 and Intel Mac. Other linux and M1 Mac with rosetta should also work but they're not tested.

1. Make sure you have make, cmake and nodejs. On Linux, also make sure you have gcc.
2. `./setup.sh`
3. `./build.sh`

## Usage

1. Write smart contracts with JavaScript. You can use most npm packages that uses portable ES2020 features. Export callable contract methods with export. See `examples/` for examples.
2. Build the contract with `path/to/near-sdk-js/builder.sh path/to/your/<contract-name>.js`.
3. If no errors happens, a `<contract-name>.base64` will be generate at current directory. 
4. Deploy the contract to an existing jsvm contract. You will need to attach some NEAR to cover the storage deposit. It's about 1 NEAR for every 100KB of contract. This deposit can be withdrawed when you remove the js contract. 
```
near call <jsvm-account> deploy_js_contract --accountId <your-account> --args $(cat <contract-name>.base64) --base64 --deposit 0.1
```
5. Encode the parameters and call. If the call cause the state increasement, you also need to attach NEAR to cover the storage deposit for the delta.
```
near call <jsvm-account> call_js_contract --accountId <caller-account> --args <encoded-args> --base64
```

Where `<encoded-args>` is obtained in this way:
```
let contractAccount = 'test.near'
let methodName = 'hello'
let args = ''
let input = Buffer.concat([Buffer.from(contractAccount), Buffer.from([0]), Buffer.from(methodName), Buffer.from([0]), Buffer.from(args)])
let encodedArgs = input.toString('base64')
```

6. If you want to remove the js contract and withdraw the storage deposit, use:
```
near call <jsvm-account> remove_js_contract --accountId <your-account>
```

## Demo

### On a local node

1. Build the jsvm contract
```
./setup.sh
./build.sh
```

2. Go to nearcore, Build and start a local node
```
cargo build -p neard
target/debug/neard init
target/debug/neard run
```

3. Go back to `near-sdk-js`. Have `near-cli` installed. Deploy the jsvm contract. Example session:
```
near-sdk-js (master) export NEAR_ENV=local
near-sdk-js (master) near deploy test.near jsvm.wasm 
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:XXqxAHP1ZRcwCwBTr1MbdF9NM7UVynuTnxhZfFeE5UJ
Starting deployment. Account id: test.near, node: http://localhost:3030, helper: http://localhost:3000, file: jsvm.wasm
Transaction Id EGVd29tthMp7fqkDgP8frftgZhhb3FVazaFhvXpYXNhw
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/EGVd29tthMp7fqkDgP8frftgZhhb3FVazaFhvXpYXNhw
Done deploying to test.near
```

4. Build, deploy hello contract to jsvm contract, and call hello. Example session:
```
near-sdk-js (master) ./builder.sh examples/hello_near.js 
near-sdk-js (master) near call test.near deploy_js_contract --accountId test.near --args $(cat hello_near.base64) --base64 --deposit 0.1
Scheduling a call: test.near.deploy_js_contract(AgYsZXhhbXBsZXMvaGVsbG9fbmVhci5qcwpoZWxsbwxoZWxsbzIGZW52BmxvZxRIZWxsbyBOZWFyD7wDAAIAAL4DAAHAAwAADgAGAaABAAAAAQICCwC+AwABwAMBAQjqCMAA4cAB4ikpvAMBBAEACg4OQwYBvgMAAAADAAATADjhAAAAQuIAAAAE4wAAACQBACm8AwECA10OQwYBwAMAAAADAAEQADjhAAAAQuIAAAC/ACQBACm8AwUCA04HCDIyMjI=) with attached 0.1 NEAR
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:XXqxAHP1ZRcwCwBTr1MbdF9NM7UVynuTnxhZfFeE5UJ
Doing account.functionCall()
Transaction Id Df7txPSFWwaBLTz61pSxoVrPPu6qY7fUTJ31xuQtXDBf
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/Df7txPSFWwaBLTz61pSxoVrPPu6qY7fUTJ31xuQtXDBf
''
near-sdk-js (master) near call test.near call_js_contract --accountId test.near --args 'anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==' --base64
Scheduling a call: test.near.call_js_contract(anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==)
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:XXqxAHP1ZRcwCwBTr1MbdF9NM7UVynuTnxhZfFeE5UJ
Doing account.functionCall()
Receipt: AcRRGeR16FYg5AEMZ163v5Av1NanZtRHocDUvmGTvoYN
	Log [test.near]: Hello Near
Transaction Id GkitU1Cm5bdQJWe6bzkYganiS9tfetuY4buqGFypvQWL
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/GkitU1Cm5bdQJWe6bzkYganiS9tfetuY4buqGFypvQWL
''

```

### On Testnet
Latest master version of near-sdk-js enclave has been deployed on `jsvm.testnet`. You can use it or deploy your own copy of jsvm, which is simiar to the steps for deploy on local node. The following is the step to deploy and call your contract on `jsvm.testnet`.

1. Build the contract
```
near-sdk-js (master) ./builder.sh examples/hello_near.js 
```

2. Create an account on testnet wallet. Login it with near-cli:
```
near-sdk-js (master) export NEAR_ENV=testnet
near-sdk-js (master) near login

Please authorize NEAR CLI on at least one of your accounts.

If your browser doesn't automatically open, please visit this URL
https://wallet.testnet.near.org/login/?referrer=NEAR+CLI&public_key=ed25519%3A6eNw1uLsVbvHJhPrcN9Rj9wefqfzxJ2tz7VqxY8m3F88&success_url=http%3A%2F%2F127.0.0.1%3A5000
Please authorize at least one account at the URL above.

Which account did you authorize for use with NEAR CLI?
Enter it here (if not redirected automatically):
Logged in as [ jsvmtester.testnet ] with public key [ ed25519:6eNw1u... ] successfully
```

3. Deploy the JS contract:
```
near-sdk-js (master) export JSVM_ACCOUNT=jsvm.testnet
near-sdk-js (master) near call $JSVM_ACCOUNT deploy_js_contract --accountId jsvmtester.testnet --args $(cat hello_near.base64) --base64 --deposit 0.1
Scheduling a call: jsvm.testnet.deploy_js_contract(AgYsZXhhbXBsZXMvaGVsbG9fbmVhci5qcwpoZWxsbwxoZWxsbzIGZW52BmxvZxRIZWxsbyBOZWFyD7wDAAIAAL4DAAHAAwAADgAGAaABAAAAAQICCwC+AwABwAMBAQjqCMAA4cAB4ikpvAMBBAEACg4OQwYBvgMAAAADAAATADjhAAAAQuIAAAAE4wAAACQBACm8AwECA10OQwYBwAMAAAADAAEQADjhAAAAQuIAAAC/ACQBACm8AwUCA04HCDIyMjI=) with attached 0.1 NEAR
Doing account.functionCall()
Transaction Id 46vC327SWs7JNV7G3XMHkRzETyc6WuxwkdwLhV6Go2kp
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/46vC327SWs7JNV7G3XMHkRzETyc6WuxwkdwLhV6Go2kp
''
```
Note that, in order to deploy the contract, the deployer need to deposit sufficient amount of NEAR to cover storage deposit. It's roughly 0.01 NEAR for 1KB of contract. If you deposit more than required, the additional part will be refunded. If no adequate deposit is attached, the deploy will failed with a panic. If future deployment increase or decrease in size, the difference will need to be paid or refunded, respectively.

4. Call the JS contract:
```
near-sdk-js (master) near call $JSVM_ACCOUNT call_js_contract --accountId jsvmtester.testnet --args 'anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==' --base64
Scheduling a call: jsvm.testnet.call_js_contract(anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==)
Doing account.functionCall()
Receipt: 4Mn5d3Kc4n67MxQkcEmi4gxKbrrKXvJE9Rin3q3fdCsQ
        Log [jsvm.testnet]: Hello Near
Transaction Id 43K5sjgVeWCYzuDJ3S6j5XHxQnRY8w1TQ84MiDxdtHp1
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/43K5sjgVeWCYzuDJ3S6j5XHxQnRY8w1TQ84MiDxdtHp1
''

near-sdk-js (master) near call $JSVM_ACCOUNT call_js_contract --accountId jsvmtester2.testnet --args 'anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==' --base64
Scheduling a call: jsvm.testnet.call_js_contract(anN2bXRlc3Rlci50ZXN0bmV0AGhlbGxvAA==)
Doing account.functionCall()
Receipt: DzysE3ZNG8fBY4djq1KDYyDLs53jga2Lxpou2kjm3HzC
        Log [jsvm.testnet]: Hello Near
Transaction Id AGRHcCCBCFex2hiXQh5BhFDoq7bN1eVoULhSyL4zgMRA
To see the transaction in the transaction explorer, please open this url in your browser
https://explorer.testnet.near.org/transactions/AGRHcCCBCFex2hiXQh5BhFDoq7bN1eVoULhSyL4zgMRA
''
```

Note that, the args is encoded by this JavaScript snippet: `Buffer.from("jsvmtester.testnet\x00hello\x00").toString('base64')`. The meaning is call `jsvmtester.testnet` deployed JS contract, `hello` method, with no arguments to the `hello` method. This method can be call by anyone, not just the one who deployed this JS contract (`jsvmtester.testnet`).

## NEAR-SDK-JS Low Level API Reference

**Note that, following APIs will be reworked so that 1) higher level api is available; 2) contract cannot write to other contract's storage**

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
// function current_account_id(register_id: Uint64); // this always equals to "jsvm"
function signer_account_id(register_id: Uint64);
function signer_account_pk(register_id: Uint64);
function predecessor_account_id(register_id: Uint64);
// function input(register_id: Uint64); // usable, but not in helpful format
function block_index(): Uint64;
function block_timestamp(): Uint64;
function epoch_height(): Uint64;
// function storage_usage(): Uint64; // storage usage for the enclave. actually, user cares about their contract storage usage
```

### Economics API
```
// function account_balance(): Uint128; // balance for the enclave. user cares about their contract balance
// function account_locked_balance(): Uint128; // same
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
// function promise_batch_action_create_account(promise_index: Uint64); // not allow users to create *.jsvm account
// function promise_batch_action_deploy_contract(promise_index: Uint64, code: String); // batch actions are applied to create_account_action, but that is not allowed
// function promise_batch_action_function_call(promise_index: Uint64, method_name: String, arguments: String, amount: Uint128, gas: Uint64);
// function promise_batch_action_transfer(promise_index: Uint64, amount: Uint128);
// function promise_batch_action_stake(promise_index: Uint64, amount: Uint128, public_key: String);
// function promise_batch_action_add_key_with_full_access(promise_index: Uint64, public_key: String, nonce: Uint64);
// function promise_batch_action_add_key_with_function_call(promise_index: Uint64, public_key: String, nonce: Uint64, allowance: Uint128, receiver_id: String, method_names: String);
// function promise_batch_action_delete_key(promise_index: Uint64, public_key: String);
// function promise_batch_action_delete_account(promise_index: Uint64, beneficiary_id: String);
```

### Promise API results

```
function promise_results_count(void): Uint64;
function promise_result(result_idx: Uint64, register_id: Uint64): Uint64;
function promise_return(promise_idx: Uint64);
```

### Storage API

```
// function storage_write(key: String, value: String, register_id: Uint64): Uint64; // user can only access contract's storage
function storage_read(key: String, register_id: Uint64): Uint64;
// function storage_remove(key: String, register_id: Uint64): Uint64; // same as storage_write
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
