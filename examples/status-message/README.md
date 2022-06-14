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

## Set constants
```sh
export ACCOUNT_ID=alice..test.near
export CONTRACT_ID=status-message.test.near
export JSVM_ID=jsvm.test.near
```

## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new StatusMessage()` for the class.
Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js`. Call it with:

```sh
near js call $CONTRACT_ID init --deposit 0.1 --accountId $CONTRACT_ID --jsvm $JSVM_ID
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call $JSVM_ID call_js_contract --accountId $CONTRACT_ID --base64 --args $(node ../../scripts/encode_call.js $CONTRACT_ID init '')

</p>
</details>

## Call the contract
Under the root dir of near-sdk-js, call the `set_status` and `get_status` methods with:


```sh
near js call $CONTRACT_ID set_status --args '{"message": "hello"}' --deposit 0.1 --accountId $ACCOUNT_ID --jsvm $JSVM_ID

near js view $CONTRACT_ID get_status --args '{"account_id": "'$ACCOUNT_ID'"}' --jsvm $JSVM_ID
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call $JSVM_ID call_js_contract --accountId $ACCOUNT_ID --base64 --args $(node ../../scripts/encode_call.js $CONTRACT_ID set_status '{"message":"hello"}') --deposit 0.1

    near call $JSVM_ID call_js_contract --accountId $ACCOUNT_ID --base64 --args $(node ../../scripts/encode_call.js $CONTRACT_ID get_status '{"account_id":"'$ACCOUNT_ID'"}')


</p>
</details>