# Status message contract in JavaScript

This is an equivalent JavaScript implementation of the status message example. Every user can store a message on chain. Every user can view everyone's message. Logic is implemented two times with the use of collections and without them.

## Build the contract
```
npm i
npm run build
```

Result contract bytecode files will be stored in `build/status-message.base64` and `build/status-message-collections.base64`. Intermediate JavaScript file can be found in `build/` folder. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Test the contracts with workspaces-js
```
npm run test
```

## Deploy the contract

Suppose JSVM contract was deployed to `jsvm.test.near`. Developer want to deploy the status message contract to `status-message.test.near`. Create `status-message.test.near`, `alice.test.near` and `bob.test.near` locally. Then:

```sh
export NEAR_ENV=local
near js deploy --accountId status-message.test.near --base64File build/status-message.base64 --deposit 0.1 --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    export NEAR_ENV=local
    near call jsvm.test.near deploy_js_contract --accountId status-message.test.near --args $(cat build/status-message.base64) --base64 --deposit 0.1

</p>
</details>



## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new StatusMessage()` for the class.
Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js`. Call it with:

```sh
near js call status-message.test.near init --deposit 0.1 --accountId status-message.test.near --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call jsvm.test.near call_js_contract --accountId status-message.test.near --base64 --args $(node encode_call.js status-message.test.near init '')

</p>
</details>

## Call the contract
Under the root dir of near-sdk-js, call the `set_status` and `get_status` methods with:


```sh
near js call status-message.test.near set_status --args '["hello"]' --deposit 0.1 --accountId alice.test.near--jsvm jsvm.test.near

near js view status-message.test.near get_status --args '["alice.test.near"]' --deposit 0.1 --accountId bob.test.near --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call jsvm.test.near call_js_contract --accountId alice.test.near --base64 --args $(node encode_call.js status-message.test.near set_status '["hello"]') --deposit 0.1

    near call jsvm.test.near call_js_contract --accountId bob.test.near --base64 --args $(node encode_call.js status-message.test.near get_status '["alice.test.near"]')

</p>
</details>