# NEAR-SDK-JS (Enclave)

## Getting started with template project

The fastest and recommended way to develop with near-sdk-js is to create a project with our github template: https://github.com/near/near-sdk-js-template-project.

## Running examples

There are a couple of contract examples in the project:

- [Clean contract state](https://github.com/near/near-sdk-js/tree/master/examples/clean-state)
- [Doing cross contract call](https://github.com/near/near-sdk-js/tree/master/examples/cross-contract-call)
- [Fungible token](https://github.com/near/near-sdk-js/tree/master/examples/fungible-token)
- [Lockable fungible token](https://github.com/near/near-sdk-js/tree/master/examples/lockable-fungible-token)
- [Non fungible token](https://github.com/near/near-sdk-js/tree/master/examples/non-fungible-token)
- [Status message board](https://github.com/near/near-sdk-js/tree/master/examples/status-message)

The general steps to run these contracts are same. You can also follow their corresponding READMEs to build, test and run the contracts.

### General steps to run examples locally
1. Use near-cli to deploy `jsvm.wasm` from the `res` folder to one of account you controlled. For example, `jsvm.<your-account>`:
```sh
export NEAR_ENV=local
near deploy res/jsvm.wasm <jsvm-account>
```
2. `cd examples/<example>`
3. `yarn && yarn build` to get <contract>.base64 file (JS smart-contract).
4. Deploy <contract>.base64 file to `JSVM` account from the previous step.
```sh
near js deploy --accountId <your-account> --base64File build/<contract-name>.base64 --deposit 0.1 --jsvm <jsvm-account>
```

5. Interact with your contract using NEAR CLI or `near-api-js`. Encode the parameters and call. If the call cause the state increasement, you also need to attach NEAR to cover the storage deposit for the delta.

```sh
near js call <account-that-deployed-js-to-jsvm> <method-name> --accountId <account-performing-call> --args <args> --deposit 0.1 --jsvm <jsvm-account>
```

6. If you want to remove the js contract and withdraw the storage deposit, use:

```sh
near js remove --accountId <your-account> --jsvm <jsvm-account>
```

### General steps to run examples on testnet
1. `export NEAR_ENV=testnet`
2. `cd examples/<example>`
3. `yarn && yarn build` to get <contract>.base64 file (JS smart-contract).
4. Deploy, call and remove JS contract is same as above, except <jsvm-account> is `jsvm.testnet`. This is also the default value, so you omit `--jsvm`.

## Error Handling in NEAR-SDK-JS

If you want to indicate an error happened and fail the transaction, just throw an error object in JavaScript. Our JSVM runtime will detect and automatically invoke `panic_utf8` with `"{error.message}\n:{error.stack}"`. As a result, transaction will fail with `"Smart contract panicked: {error.message}\n{error.stack}"` error message. You can also use an error utilities library to organize your errors, such as verror.

When your JS code or library throws an error, uncaught, the transaction will also fail with GuestPanic error, with the error message and stacktrace.

When call host function with inappropriate type, means incorrect number of arguments or arg is not expected type:
    - if arguments less than params, remaining argument are set as 'undefined'
    - if arguments more than params, remaining argument are ignored
    - if argument is different than the required type, it'll be coerced to required type
    - if argument is different than the required type but cannot be coerced, will throw runtime type error, also with message and stacktrace

## Test
We recommend to use near-workspaces to write tests for your smart contracts. See any of the examples for how tests are setup and written.

## NEAR-SDK-JS API Reference

All NEAR blockchain provided functionality (host functions) are defined in `src/api.js` and exported as `near`. You can use them by:
```js
import {near} from 'near-sdk-js'

// near.<api doucmented below>. e.g.:
let signer = near.signerAccountId()
```

To use nightly host functions, such as `altBn128G1Sum`, the enclave contract need to be built with `make jsvm-nightly` and deployed to a nearcore node that has nightly enabled.

### About Type

- In arguments, `Uint64: Number | BigInt`. In return, `Uint64: BigInt`. Because JavaScript Number cannot hold all Uint64 without losing precision. But as arguments, interger number is also allowed for convinience. Same for `Uint128`.
- `String` in both arguments and return is a byte buffer encoded as a JavaScript String. Which means:
    - If the string have only 1 byte chars, the representation is same.
    - If the string have 2/3/4 byte char, it is break down to 2/3/4 bytes and each byte as a separate char.
    - Arbitrary binary data `0x00-0xff` is as the char '\x00-\xff'

It's intentional to represent string and bytes in this way because QuickJS doesn't have ArrayBuffer in C API.

### Context API

```
function signerAccountId(): String;
function signerAccountPk(): String;
function predecessorAccountId(): String;
function blockIndex(): Uint64;
function blockTimestamp(): Uint64;
function epochHeight(): Uint64;
```


### Economics API
```
function attachedDeposit(): Uint128;
function prepaidGas(): Uint64;
function usedGas(): Uint64;
```

### Math API

```
function randomSeed(): String;
function sha256(value: String): String;
function keccak256(value: String): String;
function keccak512(value: String): String;
function ripemd160(value: String): String;
function ecrecover(hash: String, sign: String, v: Uint64, malleability_flag: Uint64): String | null;
```

### Miscellaneous API

```
function panic(msg?: String);
function panicUtf8(msg: String);
function log(msg: String);
function logUtf8(msg: String);
function logUtf16(msg: String);
```

### Storage API

```
function storageRead(key: String): String | null;
function storageHasKey(key: String): bool;
```

### Validator API

```
function validatorStake(account_id: String): Uint128;
function validatorTotalStake(): Uint128;
```

### Alt BN128

```
function altBn128G1Multiexp(value: String): String;
function altBn128G1Sum(value: String): String;
function altBn128PairingCheck(value: String): bool;
```

### JSVM Specific APIs
Due to the design of JavaScript VM Contract, some additonal APIs are provided to obtain context, access storage and cross contract call. Since they're not documented at [NEAR nomicon](https://nomicon.io/). They're explained here.

#### Obtain Context
```
function jsvmAccountId(): String;
function jsvmJsContractName(): String;
function jsvmMethodName(): String;
function jsvmArgs(): String;
```

The `jsvmAccountId` returns the JavaScript VM's contract account ID.

The `jsvmJsContractName`, when called, returns the JavaScript contract name that are called at the moment.

The `jsvmJsContractName` returns the method name being called.

The `jsvmArgs` return the arguments passed to the method.

#### Storage Access
```
function jsvmStorageWrite(key: String, value: String): bool;
function jsvmStorageRead(key: String): String | null;
function jsvmStorageRemove(key: String): bool;
function jsvmStorageHasKey(key: String): bool;
function storageGetEvicted(): String;
```

These are equivalent to `storage*` but access limit to the substate of current JS contract. The `jsvmStorageWrite` and `jsvmStorageRemove` require and refund deposit to cover the storage delta. `jsvmStorage*` access the substate of current JS contract by prefix the key of current JS contract name (deployer's account id). You can use `storageRead` and `storageHasKey` to get code and state of other JS contracts. More specifically: code of `contractA` is stored under the key `contractA/code`. state of `contractA` is stored under `contractA/state/` concat with developer specifid key. And:
```
jsvmStorageRead(k)
// equvalent to
storageRead(jsvmJsContractName() + '/state/' + k)
```

When `jsvmStorageWrite` write to a key that already exists, the old value would be saved and can be obtained by `storageGetEvicted()`. In this case, jsvmStorageWrite returns `true`. If key doesn't exist before, returns `false`.

When `jsvmStroageRemove` remove a key that exists, the old value would be saved and can be obtained by `storageGetEvicted()`. In this case, jsvmStroageRemove returns `true`. If key doesn't exist before, nothing is removed and returns `false`.

#### Cross Contract Call
```
function jsvmValueReturn(value: String);
function jsvmCall(contract_name: String, method: String, args: String): any;
function jsvmCallRaw(contract_name: String, method: String, args: String): String;
```

The `jsvmValueReturn` is the version of `valueReturn` that should be used in all JavaScript contracts. It play well with `jsvmCall`.

The `jsvmCall` invoke a synchronous cross contract call, to the given JavaScript `contract_name`, `method` with `args`. And returned the return value parsed as JSON into a JS object.

The `jsvmCallRaw` is similar to `jsvmCall`, but return the raw, unparsed String.

### Collections
A few useful on-chain persistent collections are provided.

#### Vector
Vector is an iterable implementation of vector that stores its content on the trie. Usage:

```js
import {Vector} from 'near-sdk-js'

// in contract class constructor:
constructor() {
    super()
    this.v = new Vector('my_prefix_')
}

// Override the deserializer to load vector from chain
deserialize() {
    super.deserialize()
    this.v = Object.assign(new Vector, this.v)
}

someMethod() {
    // insert
    this.v.push('abc')
    this.v.push('def')
    this.v.push('ghi')

    // batch insert, extend:
    this.v.extend(['xyz', '123'])

    // get
    let first = this.v.get(0)

    // remove, move the last element to the given index
    this.v.swapRemove(0) 

    // replace
    this.v.replace(1, 'jkl')

    // remove the last
    this.v.pop()

    // len, isEmpty
    let len = this.v.len()
    let isEmpty = this.v.isEnpty()

    // iterate
    for (let element of this.v) {
        near.log(element)
    }

    // toArray, convert to JavaScript Array
    let a = this.v.toArray()

    // clear
    ths.v.clear()
}
```

#### LookupMap
LookupMap is an non-iterable implementation of a map that stores its content directly on the trie. It's like a big hash map, but on trie. Usage:
```js
import {LookupMap} from 'near-sdk-js'

// in contract class constructor:
constructor() {
    super()
    this.m = new LookupMap('prefix_a')
}

// Override the deserializer to load vector from chain
deserialize() {
    super.deserialize()
    this.m = Object.assign(new LookupMap, this.m)
}

someMethod() {
    // insert
    this.m.set('abc', 'aaa')
    this.m.set('def', 'bbb')
    this.m.set('ghi', 'ccc')

    // batch insert, extend:
    this.m.extend([['xyz', '123'], ['key2', 'value2']])

    // check exist
    let exist = this.m.containsKey('abc')

    // get
    let value = this.m.get('abc')

    // remove
    this.m.remove('def') 

    // replace
    this.m.set('ghi', 'ddd')
}
```

#### LookupSet
LookupSet is an non-iterable implementation of a set that stores its content directly on the trie. It's like LookupMap, but it only stores whether the value presents. Usage:
```js
import {LookupSet} from 'near-sdk-js'

// in contract class constructor:
constructor() {
    super()
    this.s = new LookupSet('prefix_b')
}

// Override the deserializer to load vector from chain
deserialize() {
    super.deserialize()
    this.s = Object.assign(new LookupSet, this.s)
}

someMethod() {
    // insert
    this.s.set('abc')
    this.s.set('def')
    this.s.set('ghi')

    // batch insert, extend:
    this.s.extend(['xyz', '123'])

    // check exist
    let exist = this.s.contains('abc')

    // remove
    this.s.remove('def')
}
```

#### UnorderedMap
UnorderedMap is an iterable implementation of a map that stores its content directly on the trie. Usage:
```js
import {UnorderedMap} from 'near-sdk-js'

// in contract class constructor:
constructor() {
    super()
    this.m = new UnorderedMap('prefix_c')
}

// Override the deserializer to load vector from chain
deserialize() {
    super.deserialize()
    this.m.keys = Object.assign(new Vector, this.m.keys)
    this.m.values = Object.assign(new Vector, this.m.values)
    this.m = Object.assign(new UnorderedMap, this.m)
}

someMethod() {
    // insert
    this.m.set('abc', 'aaa')
    this.m.set('def', 'bbb')
    this.m.set('ghi', 'ccc')

    // batch insert, extend:
    this.m.extend([['xyz', '123'], ['key2', 'value2']])

    // get
    let value = this.m.get('abc')

    // remove
    this.m.remove('def') 

    // replace
    this.m.set('ghi', 'ddd')

    // len, isEmpty
    let len = this.m.len()
    let isEmpty = this.m.isEnpty()

    // iterate
    for (let [k, v] of this.m) {
        near.log(k+v)
    }

    // toArray, convert to JavaScript Array
    let a = this.m.toArray()

    // clear
    this.m.clear()
}
```

#### UnorderedSet
UnorderedSet is an iterable implementation of a set that stores its content directly on the trie. It's like UnorderedMap but it only stores whether the value presents. Usage:
```js
import {UnorderedSet} from 'near-sdk-js'

// in contract class constructor:
constructor() {
    super()
    this.s = new UnorderedSet('prefix_d')
}

// Override the deserializer to load vector from chain
deserialize() {
    super.deserialize()
    this.s.elements = Object.assign(new Vector, this.s.elements)
    this.s = Object.assign(new UnorderedSet, this.s)
}

someMethod() {
    // insert
    this.s.set('abc')
    this.s.set('def')
    this.s.set('ghi')

    // batch insert, extend:
    this.s.extend(['xyz', '123'])

    // check exist
    let exist = this.s.contains('abc')

    // remove
    this.s.remove('def')

    // len, isEmpty
    let len = this.s.len()
    let isEmpty = this.s.isEnpty()

    // iterate
    for (let e of this.s) {
        near.log(e)
    }

    // toArray, convert to JavaScript Array
    let a = this.s.toArray()

    // clear
    this.s.clear()
}
```

### APIs not available in JSVM
Due to the architecture of the JSVM, some NEAR host functions, part of Standalone SDK or Rust SDK, are not revelant or being replaced by above JSVM specific APIs. Those unavailable APIs are explained here.

- The `current_account_id` would always puts the account id of the JavaScript VM contract account in given register. The naming `current_account_id` is therefore confusing and not as helpful as a Rust contract. In some case, developer may want to get JavaScript VM contract account name, for example, determines whether it's running on testnet or mainnet, and behaves differently. So we expose this functionality under `jsvm_account_id()`.

- The `input` puts the argument passed to call the contract in given register. In JavaScript VM, this is encoded as `"js_contract_name\0method_name\0args...`. This format isn't very convinient to developer, therefore, separate API `jsvm_js_contract_name`, `jsvm_method_name` and `jsvm_args` are provided.

- The `storage_usage` return the storage bytes used by JavaScript VM contract. User doesn't care about the storage usage of the JSVM. Instead, users care about storage usage of a given JavaScript contract. This can be obtained by `storage_read` and count the sum of `register_len`.

- The `account_balance` and `account_locked_balance` returns balance and locked_balance of JavaScript VM. Those are also not cared by users.

- The `value_return` is a NEAR primitive that puts the value to return in a receipt. However we would want to access it as a JavaScript return value in a cross contract call. So we have a new API `jsvmValueReturn`, which does return the value in receipt and also as a JavaScript value returned by `jsvm_call`. The `jsvmValueReturn` should be used whenever you need `value_return`.

- `abort` is intended to mark error location (line number). A full stacktrace with line numbers is provided by QuickJS, available when you throw a JS Error. So this API isn't needed.

- Promise APIs act on the JSVM contract and could create subaccount, use the balance from JSVM account.JSVM would be a common VM used by the community instead of a Rust contract owned by the deployer. Therefore, promise APIs are not allowed.

- The `storage_write` and `storage_remove` have access to all JavaScript contract codes and states deployed on JSVM. User can only write to their account owned code and state, as a substate of the JSVM. Therefor these two APIs are disallowed. Use `jsvm_storage_write` and `jsvm_storage_remove` instead. Read to other people owned code and state is allowed, as they're public as part of the blockchain anyway.


## Advanced guides

### Manual setup with npm package

You can also layout your project by install the npm package manually:
```
yarn add near-sdk-js
# or
npm install near-sdk-js
```

### NEAR-SDK-JS contributor setup

It is tested on Ubuntu 20.04, Intel Mac and M1 Mac. Other linux should also work but they're not tested.

1. Make sure you have `wget`, `make`, `cmake` and `nodejs`. On Linux, also make sure you have `gcc`.
2. Run `make` to get platform specific `qjsc` and `jsvm` contract in `res` folder.


### Run NEAR-SDK-JS tests
See https://github.com/near/near-sdk-js/tree/master/tests


### Low level way to invoke NEAR-CLI

`near js` subcommand in near-cli is a recent feature. Under the hood, it is encoding a special function call to jsvm contract. 

#### Deploy a JS contract

<details>
<summary><strong>The equivalent raw command is:</strong></summary>
<p>

    near call <jsvm-account> deploy_js_contract --accountId <your-account> --args $(cat <contract-name>.base64) --base64 --deposit 0.1

</p>
</details>

#### Call a JS contract

<details>
<summary><strong>The equivalent raw command is:</strong></summary>
<p>

    near call <jsvm-account> call_js_contract --accountId <your-account> --args <encoded-args> --base64

    # where `<encoded-args>` can be obtained by:
    node scripts/encode_call.js <your-account> <method-name> <args>

</p>
</details>

#### Remove a JS contract

<details>
<summary><strong>The equivalent raw command is:</strong></summary>
<p>

    near call <jsvm-account> remove_js_contract --accountId <your-account>

</p>
</details>
