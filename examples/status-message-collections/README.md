# Status message contract in JavaScript

This is an JavaScript implementation of the status message collections example. Every user can store a message on chain. Every user can view everyone's message. It is also intended to test SDK collections.

## Build the contract

First ensure JSVM contract is build and deployed locally, follow [Local Installation](https://github.com/near/near-sdk-js#local-installation). Then run:
```
npm i
npm run build
```

Result contract bytecode file will be in `build/contract.base64`. Intermediate JavaScript file can be found in `build/contract.js`. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Test the contract with workspaces-js
```
npm run test
```
