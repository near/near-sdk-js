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

3. Go to nearcore, near-sdk-js branch, build near-vm-runner-standalone and try:
```
target/debug/near-vm-runner-standalone --method-name get_num --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name increment --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name reset --wasm-file counter.wasm
target/debug/near-vm-runner-standalone --method-name decrement --wasm-file counter.wasm --state '{"YQ==":"MA=="}'
```