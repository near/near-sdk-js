# Status message contract in JavaScript

This is an equivalent JavaScript implementation of the status message example. Every user can store a message on chain. Every user can view everyone's message.

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

Suppose JSVM contract was deployed to `jsvm.test.near`. Developer want to deploy the status message contract to `status-message.test.near`. Create `status-message.test.near`, `alice.test.near` and `bob.test.near` locally. Then:

```
export NEAR_ENV=local
near call jsvm.test.near deploy_js_contract --accountId status-message.test.near --args $(cat build/status-message.base64) --base64 --deposit 0.1
```

## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new StatusMessage()` for the class.
Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js`. Call it with:

```
near call jsvm.test.near call_js_contract --accountId status-message.test.near --base64 --args $(node encode_call.js status-message.test.near init '')
```

## Call the contract
Under the root dir of near-sdk-js, call the `set_status` and `get_status` methods with:

```
near call jsvm.test.near call_js_contract --accountId alice.test.near --base64 --args $(node encode_call.js status-message.test.near set_status '["hello"]') --deposit 0.1

near call jsvm.test.near call_js_contract --accountId bob.test.near --base64 --args $(node encode_call.js status-message.test.near get_status '["alice.test.near"]')
```

Note that although `get_status` can be called as a view method with near-api-js, currently it cannot be called with near-cli because near-cli does not support base64 encoded arguments in view call. 
