The main documentation is in doc/quickjs.pdf or doc/quickjs.html.

Build contract for NEAR
=======================

Prerequisites
-------------

- Ubuntu 20.04
- gcc
- make
- clang and llvm
- wasi-sdk 11: https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-11/wasi-sdk-11.0-linux.tar.gz
- wasi-libc: https://github.com/WebAssembly/wasi-libc.git, place it in ~/Downloads/pkg/wasi-libc


Steps
-----
1. Uncompress wasi-sdk, find lib/clang/10.0.0/lib/wasi/libclang_rt.builtins-wasm32.a and place it in
 /usr/lib/llvm-10/lib/clang/10.0.0/lib/wasi/libclang_rt.builtins-wasm32.a

2. ./build_counter.sh. move the built counter.wasm to nearcore.

3. Go to nearcore, near-sdk-js branch, build near-vm-runner-standalone and run:
```
target/debug/near-vm-runner-standalone --method-name get_num --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name increment --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name reset --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name decrement --wasm-file counter.wasm --state '{"YQ==":"MA=="}'
```

4. Alternatively, run a local node, deploy and call methods:
```
quickjs (near-sdk-js) export NEAR_ENV=local
quickjs (near-sdk-js) near deploy test.near counter.wasm 
Starting deployment. Account id: test.near, node: http://localhost:3030, helper: http://localhost:3000, file: counter.wasm
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Transaction Id WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/WJ5vz8NZbi2oxg9wKhkcLZcF8WatXYVY8PMu96FXPPF
Done deploying to test.near

quickjs (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: m2oWjsWUdr1AdP2AVB8snnK3PRGNgu9sQJVMuYcbmar
        Log [test.near]: Increased number to 1
Transaction Id 6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/6Lhq2cXuaiwAtdcwyoXhpXYkd3MRZNCjGKL3oRrVeXM3
''

quickjs (near-sdk-js) near call test.near increment --accountId test.near --args ''
Scheduling a call: test.near.increment()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
Doing account.functionCall()
Receipt: Ez8yqQgNiX7sNg3hRYdu6pAGsuvPqd2z5JFacKmnTErg
        Log [test.near]: Increased number to 2
Transaction Id 5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
To see the transaction in the transaction explorer, please open this url in your browser
http://localhost:9001/transactions/5ERxe2AnfxoqrqHq1qDZtzWqM6j1uAbLscAchJ39yMDZ
''

quickjs (near-sdk-js) near view test.near get_num --accountId test.near --args ''
View call: test.near.get_num()
Loaded master account test.near key from /home/bo/.near/validator_key.json with public key = ed25519:4tfuwpXjdHh22wuDigTTESxARtv2kdS78w3RnanKDQLb
2

```