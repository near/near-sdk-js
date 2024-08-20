# NEAR JavaScript SDK

## Quick Start

Use [`create-near-app`](https://github.com/near/create-near-app) to quickly get started writing smart contracts in JavaScript on NEAR.

    npx create-near-app

This will scaffold a basic template for you 😎

Learn more in our [Quick Start guide](https://docs.near.org/develop/quickstart-guide).

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
- [Programmatic Update After Locking The Contract](https://github.com/near/near-sdk-js/tree/develop/examples/src/programmatic-update.js)

To build all examples, run `pnpm build` in `examples/`. To test all examples, run `pnpm test`. You can also build and test one specific example with `pnpm build:<example-name>` and `pnpm test:<example-name>`, see `examples/package.json`.

To deploy and call a contract on a NEAR node, use near-cli's `near deploy` and `near call`.

## Test

We recommend to use near-workspaces to write tests for your smart contracts. See any of the examples for how tests are setup and written.

## Error Handling in NEAR-SDK-JS

If you want to indicate an error happened and fail the transaction, just throw an error object in JavaScript. The compiled JavaScript contract includes error handling capability. It will catch throwed errors and automatically invoke `panic_utf8` with `"{error.message}\n:{error.stack}"`. As a result, transaction will fail with `"Smart contract panicked: {error.message}\n{error.stack}"` error message. You can also use an error utilities library to organize your errors, such as verror.

When your JS code or library throws an error, uncaught, the transaction will also fail with GuestPanic error, with the error message and stacktrace.

When call host function with inappropriate type, means incorrect number of arguments or arg is not expected type:

- if arguments less than params, remaining argument are set as 'undefined'
- if arguments more than params, remaining argument are ignored
- if argument is different than the required type, it'll be coerced to required type
- if argument is different than the required type but cannot be coerced, will throw runtime type error, also with message and stacktrace

## Migrating from near-sdk-js 0.6.0

If you have a near-sdk-js 0.6.0 contract, you need to drop the `babel.config.json` because it is now inlined in near-sdk-js CLI.

Also `Bytes` type in 0.6.0 is replaced with `string` and `Uint8Array`. Because `Bytes` was an alias to `string`, this doesn't affect all collection APIs and most low level APIs. Some low level APIs below now also comes with a raw version, which ends with `Raw` and takes `Uint8Array` instead of `string`, for example, `storageRead` vs `storageReadRaw`. Some low level APIs have more sense to use `Uint8Array` instead of `string`, such as `sha256` and arguments for a function call type of promise, these are **BREAKING** changes. Please refer to next section for details: look for functions with `Uint8Array` argument and return types.

## NEAR-SDK-JS API Reference

All NEAR blockchain provided functionality (host functions) are defined in `src/api.ts` and exported as `near`. You can use them by:

```js
import { near } from "near-sdk-js";

// near.<api doucmented below>. e.g.:
let signer = near.signerAccountId();
```

### About Type

NEAR-SDK-JS is written in TypeScript, so every API function has a type specified by signature that looks familiar to JavaScript/TypeScript Developers. Two types in the signature need a special attention:

- Most of the API take `bigint` instead of Number as type. This because JavaScript Number cannot hold 64 bit and 128 bit integer without losing precision.
- For those API that takes or returns raw bytes, it is a JavaScript `Uint8Array`. You can use standard `Uint8Array` methods on it or decode it to string with `decode` or `str`. The differece between `decode` and `str` is: `decode` decode the array as UTF-8 sequence. `str` simply converts each Uint8 to one char with that char code.

### Context API

 - `currentAccountId()` -- Returns the ID of the current contract - the contract that is being executed.

 - `signerAccountId()` -- Returns the ID of the account that signed the transaction.

 - `signerAccountPk()` -- Returns the public key of the account that signed the transaction.

 - `predecessorAccountId()` -- Returns the ID of the account that called the function.

 - `inputRaw()` -- Returns the arguments passed to the current smart contract call.

 - `input()` -- Returns the arguments passed to the current smart contract call as utf-8 string.

 - `blockIndex()` -- Returns the current block index.

 - `blockHeight()` -- Returns the current block height.

 - `blockTimestamp()` -- Returns the current block timestamp.

 - `epochHeight()` -- Returns the current epoch height.

 - `storageUsage()` -- Returns the current accounts NEAR storage usage.

### Economics API

- `accountBalance()` -- Returns the current account's account balance.

- `accountLockedBalance()` -- Returns the current account's locked balance.

- `attachedDeposit()` -- Returns the amount of NEAR attached to this function call. Can only be called in payable functions.

- `prepaidGas()` -- Returns the amount of Gas that was attached to this function call.

- `usedGas()` -- Returns the amount of Gas that has been used by this function call until now.

### Math API

- `altBn128G1Multiexp` -- Compute alt_bn128 g1 multiexp. `alt_bn128` is a specific curve from the Barreto-Naehrig(BN) family. It is particularly well-suited for ZK proofs.

- `altBn128G1Sum` - Computes sum for signed g1 group elements on alt_bn128 curve.

- `altBn128PairingCheck(value: Uint8Array)` -- Computes pairing check on alt_bn128 curve.

- `randomSeed()` -- Returns a random string of bytes.

- `sha256(value: Uint8Array)` - Returns sha256 hash of given value.

- `keccak256(value: Uint8Array)` -- Returns keccak256 hash of given value.

- `keccak512(value: Uint8Array)` -- Returns keccak512 hash of given value.

- `ripemd160(value: Uint8Array)` -- Returns ripemd160 hash of given value.

- `ecrecover(hash: Uint8Array, sign: Uint8Array, v: bigint, malleability_flag: bigint)` -- Recovers an ECDSA signer address from a 32-byte message hash and a corresponding signature along with v recovery byte. Takes in an additional flag to check for malleability of the signature which is generally only ideal for transactions.

### Miscellaneous API

- `valueReturnRaw(value: Uint8Array)` -- Returns the value from the NEAR WASM virtual machine.

- `valueReturn(value: string)` -- Returns the utf-8 string value from the NEAR WASM virtual machine.

- `panicUtf8(msg: Uint8Array)` -- Panic the transaction execution with given message. 

- `logUtf8(msg: Uint8Array)` -- Log the message in transaction logs.

- `logUtf16(msg: Uint8Array)` -- Log the message in transaction logs.

- `log(...params: unknown[])` -- Logs parameters in the NEAR WASM virtual machine.

### Promises API

Asynchronous cross-contract calls allow parallel execution of multiple contracts in parallel with subsequent aggregation on another contract. env exposes the following methods:

- `promiseCreate(account_id: string, method_name: string, arguments: Uint8Array, amount: bigint, gas: bigint)` -- schedules an execution of a function on some contract;

- `promiseThen(promise_index: bigint, account_id: string, method_name: string, arguments: Uint8Array, amount: bigint, gas: bigint)` -- attaches the callback back to the current contract once the function is executed;

- `promiseAnd(...promise_idx: bigint)` -- combinator, allows waiting on several promises simultaneously, before executing the callback

- `promiseBatchCreate(account_id: string)` -- create a NEAR promise which will have multiple promise actions inside

- `promiseBatchThen(promise_index: bigint, account_id: string)` -- attach a callback NEAR promise to a batch of NEAR promise actions

### Promise API actions

- `promiseBatchActionCreateAccount(promiseIndex: PromiseIndex)` -- Attach a create account promise action to the NEAR promise index with the provided promise index.

-  `promiseBatchActionDeployContract(promiseIndex: PromiseIndex, code: Uint8Array)` -- Attach a deploy contract promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionFunctionCall(promiseIndex: PromiseIndex, methodName: string, args: string, amount: NearAmount, gas: NearAmount)` -- Attach a function call promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionFunctionCallWeight(promiseIndex: PromiseIndex, methodName: string, args: string, amount: NearAmount, gas: NearAmount, weight: GasWeight)` -- Attach a function call with weight promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionTransfer(promiseIndex: PromiseIndex, amount: NearAmount);` --  Attach a transfer promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionStake(promiseIndex: PromiseIndex, amount: NearAmount, publicKey: Uint8Array)` -- Attach a stake promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionAddKeyWithFullAccess(promiseIndex: PromiseIndex, publicKey: Uint8Array, nonce: number | bigint)` -- Attach a add full access key promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionAddKeyWithFunctionCall(promiseIndex: PromiseIndex, publicKey: Uint8Array, nonce: number | bigint, allowance: NearAmount, receiverId: string, methodNames: string)` -- Attach a add access key promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionDeleteKey(promiseIndex: PromiseIndex, publicKey: Uint8Array)` -- Attach a delete key promise action to the NEAR promise index with the provided promise index.

- `promiseBatchActionDeleteAccount(promiseIndex: PromiseIndex, beneficiaryId: string)` -- Attach a delete account promise action to the NEAR promise index with the provided promise index.

### Promise API results

- `promiseResultsCount()` -- Returns the number of promise results available.

- `promiseResultRaw(promiseIndex: PromiseIndex)` -- Returns the result of the NEAR promise for the passed promise index.

- `promiseResult(promiseIndex: PromiseIndex)` -- Returns the result of the NEAR promise for the passed promise index as utf-8 string.

- `promiseReturn(promiseIndex: PromiseIndex)` -- Executes the promise in the NEAR WASM virtual machine.

### Storage API

- `storageWriteRaw(key: Uint8Array, value: Uint8Array)` -- Writes the provided bytes to NEAR storage under the provided key.

- `storageReadRaw(key: Uint8Array)` -- Reads the value from NEAR storage that is stored under the provided key.

- `storageRemoveRaw(key: Uint8Array)` -- Removes the value of the provided key from NEAR storage.

- `storageHasKeyRaw(key: Uint8Array)` -- Checks for the existence of a value under the provided key in NEAR storage.

- `storageWrite(key: string, value: string)` -- Writes the provided utf-8 string to NEAR storage under the provided key.

- `storageRead(key: string)` -- Reads the utf-8 string value from NEAR storage that is stored under the provided key.

- `storageRemove(key: string)` -- Removes the value of the provided utf-8 string key from NEAR storage.

- `storageHasKey(key: string)` -- Checks for the existence of a value under the provided utf-8 string key in NEAR storage.

### Validator API

- `validatorStake(account_id: string)` -- Returns the number of staked NEAR of given validator, in yoctoNEAR.

- `validatorTotalStake()` --  Returns the number of staked NEAR of all validators, in yoctoNEAR

### NearBindgen and other decorators

You can write a simple smart contract by only using low-level APIs, such as `near.input()`, `near.storageRead()`, etc. In this case, the API of your contract will consist of all the exported JS functions. You can find an example of such a contract [here](https://github.com/near/near-sdk-js/blob/develop/examples/src/counter-lowlevel.js).

But if you want to build a more complex contracts with ease, you can use decorators from this SDK that will handle serialization, deserialization, and other boilerplate operations for you.

In order to do that, your contract must be a class decorated with `@NearBindgen({})`. Each method in this class with `@call({})`, `@view({})`, and `@initialize({})` decorators will become functions of your smart contract. `call` functions can change state, and `view` functions can only read it.

Your class must have a `constructor()`. You will not be able to call it, which is why it should not accept any parameters. You must declare all the parameters that you are planning to use in the constructor and set default values.

The simplest example of the contract that follows all these rules can be found [here](https://github.com/near/near-sdk-js/blob/develop/examples/src/status-message.js)

`NearBindgen` decorator can accept `requireInit parameter`.

```JS
@NearBindgen({ requireInit: true })
class YourContract {
    ...
}
```

It is `false` by default, but if you will set it to `true`, it will prevent all the `call` functions from being executed before you initialize the state of the contract.

In order to initialize the contract, you need to add functions flagged with `@initialize({})` decorator.

`@call({})` decorator can accept two parameters: `privateFunction` and `payableFunction`. They are both `false` by default.

`privateFunction: true` can restrict access to this function to the contract itself.

`payableFunction: true` will allow the function to accept payments (deposit). Without this flag, it will panic if any deposit was provided.

### Collections

A few useful on-chain persistent collections are provided. All keys, values and elements are of type `string`.

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
    let len = this.v.length
    let isEmpty = this.v.isEmpty()

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
    let len = this.m.length
    let isEmpty = this.m.isEmpty()

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
    let len = this.s.length
    let isEmpty = this.s.isEmpty()

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

### Highlevel Promise APIs

Within a contract class that decorated by `@Nearbindgen`, you can work a high level JavaScript class, called `NearPromise`. It's equivalently expressive as promise batch APIs but much shorter to write and can be chained like a JavaScript Promise.

In a `@call` method, you can return either a JavaScript value or a `NearPromise` object. In the later case, `@NearBindgen` will automatically `promiseReturn` it for you.

Usage:

```js
// create new promise
import { NearPromise, near, includeBytes } from "near-sdk-js";
import { PublicKey } from "near-sdk-js/lib/types";

let promise = NearPromise.new("account-to-run-promise");

// possible promise actions, choose and chain what you need:
promise
  .createAccount()
  .transfer(1_000_000_000_000_000_000_000_000_000_000_000_000n)
  .addFullAccessKey(new PublicKey(near.signerAccountPk()))
  .addAccessKey(
    new PublicKey(near.signerAccountPk()),
    250000000000000000000000n, // allowance
    "receiver_account_id",
    "allowed_function_names"
  )
  .stake(100000000000000000000000000000n, new PublicKey(near.signerAccountPk()))
  .deployContract(includeBytes("path/to/contract.wasm"))
  .functionCall(
    "callee_contract_account_id",
    inputArgs,
    0, // amount
    2 * Math.pow(10, 13) // gas
  )
  .functionCallWeight(
    "callee_contract_account_id",
    inputArgs,
    0, // amount
    2 * Math.pow(10, 13), // gas
    1 // weight
  )
  .deleteKey(new PublicKey(near.signerAccountPk()))
  .deleteAccount("beneficial_account_id");

return promise;
```

In the case of deploy contract, `includeBytes` is a helpful build-time util. You can include the content of a wasm contract, by using `includeBytes('path/to/contract.wasm')`.

In the case of `addFullAccessKey`, `addAccessKey` and `stake`, it takes a `PublicKey` object, you can find more details about it in the Types sections below.

Besides above APIs to build something on top of an API, you can also chain promises with `.then` and `.and`, they're equivalent to promiseThen, promiseAnd:

```js
// assume promise, promise2 and promise3 are create with above APIs, with several actions added like above.
promise.and(promise2).then(promise3); // promiseAnd of [promise_id, promise2_id], then promiseThen(promise_and_id, promise3_id)

return promise;
```

### Types

NEAR-SDK-JS also includes type defintions that are equivalent to that in Rust SDK / nearcore. You can browse them in near-sdk-js/src/types. Most of them are just type alias to string and bigint.

#### Public Key

Public Key is representing a NEAR account's public key in a JavaScript class. You can either initiate a Public Key from binary data, or from a human readable string.

The binary data is in the same format as nearcore in `Uint8Array`. That's one byte to represent the curve type of the public key, either ed25519 (`0x0`), or secp256k1 (`0x1`), follows by the curve-specific public key data in bytes. Examples:

```js
new PublicKey(near.signerAccountPk());
let pk = new PublicKey(
  new Uint8Array([
    // CurveType.ED25519 = 0
    0,
    // ED25519 PublicKey data
    186, 44, 216, 49, 157, 48, 151, 47, 23, 244, 137, 69, 78, 150, 54, 42, 30, 248,
    110, 26, 205, 18, 137, 154, 10, 208, 26, 183, 65, 166, 223, 18,
  ])
);
let pk = new PublicKey(
  new Uint8Array([
    // CurveType.SECP256K1 = 1
    1,
    // SECP256K1 PublicKey data
    242, 86, 198, 230, 200, 11, 33, 63, 42, 160, 176, 23, 68, 35, 93, 81, 92, 89,
    68, 53, 190, 101, 27, 21, 136, 58, 16, 221, 71, 47, 166, 70, 206, 98, 234, 243,
    103, 13, 197, 203, 145, 0, 160, 202, 42, 85, 178, 193, 71, 193, 233, 163, 140,
    228, 40, 135, 142, 125, 70, 225, 251, 113, 74, 153,
  ])
);
```

The human readable form is `ed25519:` or `secp256k1:` following base58-encoded public key. And initialize the Public Key with `PublicKey.fromString`:

```js
PublicKey.fromString('ed25519:DXkVZkHd7WUUejCK7i74uAoZWy1w9AZqshhTHxhmqHuB`)
PublicKey.fromString('secp256k1:5r22SrjrDvgY3wdQsnjgxkeAbU1VcM71FYvALEQWihjM3Xk4Be1CpETTqFccChQr4iJwDroSDVmgaWZv2AcXvYeL`)
```

Once a PublicKey object is created, it can be used in high level promise APIs that takes a public key, such as `addFullAccessKey`, `addAccessKey` and `stake`.

## How to use NEAR SDK JS on Windows

You can develop smart contracts on Windows using Windows Subsystem for Linux (WSL2).
In order to use WSL2, follow the next steps:

- Run `PowerShell` as Administrator
- Execute `wsl --install` to install Ubuntu and do additional setup automatically. Check more details [here](https://learn.microsoft.com/en-us/windows/wsl/install)
- Restart your machine
- `WSL2` will continue setup process on start. Setup your username and password when prompted.
- Check [this](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl) guide to setup `npm`, `node`, `npx`, `VSCode` and other tools of your choice in order to start developing.

In case of any issues of setting up WSL2 make sure that:

- Your Windows OS is up to date
- Virtualisation is turned on in BIOS
- `Windows Subsystem for Linux` and `Virtual Machine Platform` are turned on in `Windows Features` (Start -> Search -> Turn Windows Feature On or Off)
