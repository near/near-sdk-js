# NEAR-SDK-JS (Standalone)

## Installation
It is tested on Ubuntu 20.04, M1 Mac and Intel Mac. Other linux should also work but they're not tested.

1. Make sure you have make, cmake and nodejs. On Linux, also make sure you have gcc.
2. `make setup`

## Usage

1. Copy project layout including configurations from `examples/` as a starting point
2. Write smart contracts with JavaScript. You can use most npm packages that uses portable ES2020 features. 
3. Build the contract with `yarn build`.
4. If no errors happens, a `<contract-name>.wasm` will be generate at `<project-dir>/build/`. It can be tested with workspaces-js and deployed to a NEAR node.

## Running Examples
There are a couple of contract examples in the project:

- [Clean contract state](https://github.com/near/near-sdk-js/tree/develop/examples/src/clean-state.js)
- [Counter using low level API](https://github.com/near/near-sdk-js/tree/develop/examples/src/counter-lowlevel.js)
- [Counter in JavaScript](https://github.com/near/near-sdk-js/tree/develop/examples/src/counter.js)
- [Counter in TypeScript](https://github.com/near/near-sdk-js/tree/develop/examples/src/counter.ts)
- [Doing cross contract call](https://github.com/near/near-sdk-js/tree/develop/examples/src/cross-contract-call.js)
- [Fungible token](https://github.com/near/near-sdk-js/tree/develop/examples/src/fungible-token.js)
- [Lockable fungible token](https://github.com/near/near-sdk-js/tree/develop/examples/src/fungible-token-lockable.js)
- [Non fungible token](https://github.com/near/near-sdk-js/tree/develop/examples/src/non-fungible-token.js)
- [Non fungible token receiver contract](https://github.com/near/near-sdk-js/tree/develop/examples/src/non-fungible-token-receiver.js)
- [Status message board](https://github.com/near/near-sdk-js/tree/develop/examples/src/status-message.js)
- [Status message board with unique messages](https://github.com/near/near-sdk-js/tree/develop/examples/src/status-message-collections.js)

To build all examples, run `yarn build` in `examples/`. To test all examples, run `yarn test`. You can also build and test one specific example with `yarn build:<example-name>` and `yarn test:<example-name>`, see `examples/package.json`.

To deploy and call a contract on a NEAR node, use near-cli's `near deploy` and `near call`.

## Error Handling in NEAR-SDK-JS

If you want to indicate an error happened and fail the transaction, just throw an error object in JavaScript. The compiled JavaScript contract includes error handling capability. It will catch throwed errors and automatically invoke `panic_utf8` with `"{error.message}\n:{error.stack}"`. As a result, transaction will fail with `"Smart contract panicked: {error.message}\n{error.stack}"` error message. You can also use an error utilities library to organize your errors, such as verror.

When your JS code or library throws an error, uncaught, the transaction will also fail with GuestPanic error, with the error message and stacktrace.

When call host function with inappropriate type, means incorrect number of arguments or arg is not expected type:
    - if arguments less than params, remaining argument are set as 'undefined'
    - if arguments more than params, remaining argument are ignored
    - if argument is different than the required type, it'll be coerced to required type
    - if argument is different than the required type but cannot be coerced, will throw runtime type error, also with message and stacktrace

## Test
We recommend to use near-workspaces to write tests for your smart contracts. See any of the examples for how tests are setup and written.

## NEAR-SDK-JS API Reference

All NEAR blockchain provided functionality (host functions) are defined in `src/api.ts` and exported as `near`. You can use them by:
```js
import {near} from 'near-sdk-js'

// near.<api doucmented below>. e.g.:
let signer = near.signerAccountId()
```

To use nightly host functions, such as `altBn128G1Sum`, your contract need to be built with nightly enabled. Use:
```
export NEAR_NIGHTLY=1
yarn build
```

### About Type

NEAR-SDK-JS is written in TypeScript, so every API function has a type specified by signature that looks familiar to JavaScript/TypeScript Developers. Two types in the signature need a special attention:
- Most of the API take `BigInt` instead of Number as type. This because JavaScript Number cannot hold 64 bit and 128 bit integer without losing precision.
- `Bytes` in both arguments and return represent a byte buffer, internally it's a JavaScript String Object. Any binary data `0x00-0xff` is stored as the char '\x00-\xff'. This is because QuickJS doesn't have ArrayBuffer in C API.
    - To ensure correctness, every `Bytes` argument need to be pass in with the `bytes()` function to runtime type check it's indeed a `Bytes`.
    - If `Bytes` is too long that `bytes()` can cause gas limit problem, such as in factory contract, represents the content of contract to be deployed. In this case you can precheck and guarantee the correctness of the content and use without `bytes()`.

### Context API

```
function currentAccountId(): String;
function signerAccountId(): String;
function signerAccountPk(): Bytes;
function predecessorAccountId(): String;
function input(): Bytes;
function blockIndex(): BigInt;
function blockHeight(): BigInt;
function blockTimestamp(): BigInt;
function epochHeight(): BigInt;
function storageUsage(): BigInt
```

### Economics API
```
function accountBalance(): BigInt;
function accountLockedBalance(): BigInt;
function attachedDeposit(): BigInt;
function prepaidGas(): BigInt;
function usedGas(): BigInt;
```

### Math API


```
function randomSeed(): Bytes;
function sha256(value: Bytes): Bytes;
function keccak256(value: Bytes): Bytes;
function keccak512(value: Bytes): Bytes;
function ripemd160(value: Bytes): Bytes;
function ecrecover(hash: Bytes, sign: Bytes, v: BigInt, malleability_flag: BigInt): Bytes | null;
```

### Miscellaneous API


```
function valueReturn(value: Bytes);
function panic(msg?: String);
function panicUtf8(msg: Bytes);
function log(msg: String);
function logUtf8(msg: Bytes);
function logUtf16(msg: Bytes);
```

### Promises API

```
function promiseCreate(account_id: String, method_name: String, arguments: Bytes, amount: BigInt, gas: BigInt): BigInt;
function promiseThen(promise_index: BigInt, account_id: String, method_name: String, arguments: Bytes, amount: BigInt, gas: BigInt): BigInt;
function promiseAnd(...promise_idx: BigInt): BigInt;
function promiseBatchCreate(account_id: String): BigInt;
function promiseBatchThen(promise_index: BigInt, account_id: String): BigInt;
```

### Promise API actions

```
function promiseBatchActionCreateAccount(promise_index: BigInt);
function promiseBatchActionDeployContract(promise_index: BigInt, code: Bytes);
function promiseBatchActionFunctionCall(promise_index: BigInt, method_name: String, arguments: Bytes, amount: BigInt, gas: BigInt);
function promiseBatchActionTransfer(promise_index: BigInt, amount: BigInt);
function promiseBatchActionStake(promise_index: BigInt, amount: BigInt, public_key: Bytes);
function promiseBatchActionAddKeyWithFullAccess(promise_index: BigInt, public_key: Bytes, nonce: BigInt);
function promiseBatchActionAddKeyWithFunctionCall(promise_index: BigInt, public_key: Bytes, nonce: BigInt, allowance: BigInt, receiver_id: String, method_names: String);
function promiseBatchActionDeleteKey(promise_index: BigInt, public_key: Bytes);
function promiseBatchActionDeleteAccount(promise_index: BigInt, beneficiary_id: String);
```

### Promise API results

```
function promiseResultsCount(): BigInt;
function promiseResult(result_idx: BigInt, register_id: BigInt): BigInt;
function promiseReturn(promise_idx: BigInt);
```

### Storage API

```
function storageWrite(key: Bytes, value: Bytes, register_id: BigInt): BigInt;
function storageRead(key: Bytes, register_id: BigInt): BigInt;
function storageRemove(key: Bytes, register_id: BigInt): BigInt;
function storageHasKey(key: Bytes): BigInt;
```

### Validator API

```
function validatorStake(account_id: String): BigInt;
function validatorTotalStake(): BigInt;
```

### Alt BN128

```
function altBn128G1Multiexp(value: Bytes, register_id: BigInt);
function altBn128G1Sum(value: Bytes, register_id: BigInt);
function altBn128PairingCheck(value: Bytes): BigInt;
```

### Collections
A few useful on-chain persistent collections are provided. All keys, values and elements are of type `Bytes`.

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
