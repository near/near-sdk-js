# Non-fungible token contract in JavaScript

This is an equivalent JavaScript implementation of the non-fungible token example. Every user can send and receive a non-fungible token.

## Build the contract

First ensure JSVM contract is build and deployed locally, follow [Local Installation](https://github.com/near/near-sdk-js#local-installation). Then run:
```
npm i
npm run build
```

Result contract bytecode file will be in `build/fungible-token.base64`. Intermediate JavaScript file can be found in `build/fungible-token.js`. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Deploy the contract

Suppose JSVM contract was deployed to `jsvm.test.near`. Developer want to deploy the fungible token contract to `nft-jsvm.test.near`. Create `nft-jsvm.test.near`, `alice.test.near` and `bob.test.near` locally. Then:

```sh
export NEAR_ENV=local
near js deploy --accountId nft-jsvm.test.near --base64File build/non-fungible-token.base64 --deposit 0.1 --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    export NEAR_ENV=local
    near call jsvm.test.near deploy_js_contract --accountId nft-jsvm.test.near --args $(cat build/non-fungible-token.base64) --base64 --deposit 0.1

</p>
</details>

## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new NftContract(owner_id, owner_by_id_prefix)` for the class.
Go back to the root dir of near-sdk-js, where we have a helper `encode-call.js`. Call it with:

```sh
near js call nft-jsvm.test.near init --args '["nft-jsvm.test.near", "prefix"]' --deposit 0.1 --accountId nft-jsvm.test.near --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call jsvm.test.near call_js_contract --accountId nft-jsvm.test.near --base64 --args $(node encode_call.js nft-jsvm.test.near init '["nft-jsvm.test.near", "prefix"]') --deposit 0.1

</p>
</details>

## Call the contract
Under the root dir of near-sdk-js, call the `nftMint` and `nftToken` methods with:

```sh
near js call nft-jsvm.test.near nftMint --args '["1", "alice.test.near"]' --deposit 0.1 --accountId nft-jsvm.test.near --jsvm jsvm.test.near

near js call nft-jsvm.test.near nftToken --args '["1"]' --deposit 0.1 --accountId nft-jsvm.test.near --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call jsvm.test.near call_js_contract --accountId nft-jsvm.test.near --base64 --args $(node encode_call.js nft-jsvm.test.near nftMint '["1", "alice.test.near"]') --deposit 0.1

    near call jsvm.test.near call_js_contract --accountId nft-jsvm.test.near --base64 --args $(node encode_call.js nft-jsvm.test.near nftToken '["1"]')

</p>
</details>

To transfer the NFT to Bob and check its new owner:

```sh
near js call nft-jsvm.test.near nftTransfer --args '["bob.test.near", "1"]' --deposit 0.1 --accountId nft-jsvm.test.near --jsvm jsvm.test.near

near js call nft-jsvm.test.near nftToken --args '["1"]' --deposit 0.1 --accountId nft-jsvm.test.near --jsvm jsvm.test.near
```

<details>
<summary><strong>Or with the raw CLI call command</strong></summary>
<p>

    near call jsvm.test.near call_js_contract --accountId nft-jsvm.test.near --base64 --args $(node encode_call.js nft-jsvm.test.near nftTransfer '["bob.test.near", "1"]') --deposit 0.1

    near call jsvm.test.near call_js_contract --accountId nft-jsvm.test.near --base64 --args $(node encode_call.js nft-jsvm.test.near nftToken '["1"]')

</p>
</details>
