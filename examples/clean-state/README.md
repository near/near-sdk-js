# Clean state contract in JavaScript

This is an equivalent JavaScript implementation of the clean state example. 

## Build the contract

First ensure JSVM contract is build and deployed locally, follow [Local Installation](https://github.com/near/near-sdk-js#local-installation). Then run:
```
npm i
npm run build
```

## Test the contract with workspaces-js
```
npm run test
```

## Guide on how to clean arbitrary account's state

First, build the contract as described above and deploy it to the account which state you want to clean up (this will override the contract that is currently there, but you can then re-deploy the original contract after the cleanup is done). Assuming that you are using JSVM contract deployed to `jsvm.testnet`, run the following command:

```
near call jsvm.testnet deploy_js_contract --accountId account-to-cleanup.testnet --args $(cat build/contract.base64) --base64 --deposit 0.1
```

Now, you can call the `clean` method to delete the unwanted keys:

```
near call jsvm.testnet call_js_contract --accountId account-to-cleanup.testnet --base64 --args $(node encode_call.js account-to-cleanup.testnet clean '[["key1", "key2"]]') --deposit 0.1
```

If gas limit prevents you from deleting all keys you want at once, just split the array into multiple parts and make a few subsequent `clean` calls.

Once you are done, just de-deploy the original contract and you should be all set:

```
near call jsvm.testnet deploy_js_contract --accountId account-to-cleanup.testnet --args $(cat path-to-original-contract.base64) --base64 --deposit 0.1
```
