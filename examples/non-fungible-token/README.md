# Non-fungible token contract in JavaScript

This is an equivalent JavaScript implementation of the non-fungible token example. Every user can send and receive a non-fungible token.

## Build the contract

First ensure JSVM contract is build and deployed locally, follow [Local Installation](https://github.com/near/near-sdk-js#local-installation). Then run:
```
npm i
npm run build
```

Result contract bytecode file will be in `build/status-message.base64`. Intermediate JavaScript file can be found in `build/status-message.js`. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Test the contract with workspaces-js
```
npm run test
```

## Deploy the contract

Suppose JSVM contract was deployed to `jsvm.test.near`. Developer want to deploy the status message contract to `nft-jsvm.test.near`. Create `nft-jsvm.test.near`, `alice.test.near` and `bob.test.near` locally. Then:

```
export NEAR_ENV=local
near call jsvm.test.near deploy_js_contract --accountId nft-jsvm.test.near --args $(cat build/non-fungible-token.base64) --base64 --deposit 0.1
```

## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new NftContract(owner_id, owner_by_id_prefix)` for the class.
Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js`. Call it with:

```
near call jsvm.test.near call_js_contract --accountId nft-jsvm.testnet --base64 --args $(node encode_call.js nft-jsvm.testnet init '["nft-jsvm.testnet", "prefix"]') --deposit 0.1
```

## Call the contract
Under the root dir of near-sdk-js, call the `nftMint` and `nftToken` methods with:

```
near call jsvm.test.near call_js_contract --accountId nft-jsvm.testnet --base64 --args $(node encode_call.js nft-jsvm.testnet nftMint '["1", "alice.test.near"]') --deposit 0.1

near call jsvm.test.near call_js_contract --accountId nft-jsvm.testnet --base64 --args $(node encode_call.js nft-jsvm.testnet nftToken '["1"]')
```

Note that although `get_status` can be called as a view method with near-api-js, currently it cannot be called with near-cli because near-cli does not support base64 encoded arguments in view call. 

To transfer the NFT to Bob and check its new owner:

```
near call jsvm.test.near call_js_contract --accountId nft-jsvm.testnet --base64 --args $(node encode_call.js nft-jsvm.testnet nftTransfer '["bob.test.near", "1"]') --deposit 0.1

near call jsvm.test.near call_js_contract --accountId nft-jsvm.testnet --base64 --args $(node encode_call.js nft-jsvm.testnet nftToken '["1"]')
```
