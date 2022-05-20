# Enclaved cross-contract-call in JavaScript

This example demonstrates how you can make a cross-contract call (contract call that is made from inside of the contract). Here we have 2 smart contracts: `status_message` from `../status-message` example and `on-call` contract in `src`. When somebody is trying to set a person on-call, smart-contract will check if the person is `AVAILABLE`. A person's status is in control of the person itself.

A good place to start is the integration test stored in `__tests__/` folder.

## Build the contract

First ensure JSVM contract is built and deployed locally, follow [Local Installation](https://github.com/near/near-sdk-js#local-installation). Then run:
```
yarn
yarn build
```

The result contract bytecode file will be in `build/on-call.base64`. An intermediate JavaScript file can be found in `build/on-call.js`. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for the curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Test the contract with workspaces-js
```
yarn test
```

## Deploy the contract

Suppose JSVM contract was deployed to `jsvm.test.near`. Now you want to deploy the status-message contract to `status-message.test.near` and on-call contract to `on-call.test.near`. Create `status-message.test.near`, `on-call.test.near`, `alice.test.near` and `bob.test.near` locally. Then deploy the contracts following this pattern using the latest `near-cli`:
```sh
export NEAR_ENV=local
near js deploy --accountId <accountId> --base64File <contract-name>.base64 --deposit 0.1 --jsvm jsvm.test.near
```

or with the raw CLI call command:
```sh
export NEAR_ENV=local
near call jsvm.test.near deploy_js_contract --accountId <accoundId> --args $(cat <contract-name>.base64) --base64 --deposit 0.1
```

## Initialize the contract

Now we need to initialize `status-message` and `on-call` contracts after deployment is ready, call the `init` method which will execute `new OnCall()` or `new StatusMessage()` respectfully.

Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js` and use this pattern to init contracts:

```sh
near js call <contract-id> init --deposit 0.1 --accountId <signer-id> --jsvm jsvm.test.near
```

or with the raw CLI call command:
```sh
near call jsvm.test.near call_js_contract --base64 --args $(node encode_call.js <contract-id> init '') --accountId <signer-id>
```

## Call the contract
Under the root dir of near-sdk-js, call the `set_status` and `set_person_on_call` using this pattern:

```sh
near js call <contract-id> <function-name> [--args '<parameter>'] --deposit 0.1 --accountId <signer-id> --jsvm jsvm.test.near
```

or with the raw CLI call command:
```
near call jsvm.test.near call_js_contract --accountId <accountID> --base64 --args $(node encode_call.js <contract-account-id> <function-name> '[<parameter>]') --deposit 0.1
```
