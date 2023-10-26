# Runtime Investigate
Investigate how to compile js/ts to wasm by any tools, and the output wasm file can be executed on wasm runtime in [nearcore](https://github.com/near/nearcore)
## Table of Contents
- [quickjs](#quickjs)
- [hermes](#hermes)
- [wasmnizer-ts](#wasmnizer-ts)
### quickjs
:white_check_mark: Currently our near-sdk-js use [quickjs engine](https://bellard.org/quickjs/) to compile js->C/C++->wasm.
### hermes
:x: We can't find any tools to compile [hermes engine](https://github.com/facebook/hermes) and it's api to C/C++ or wasm directly. Hermes is not support to execute wasm.
### wasmnizer-ts
:x: [Wasmnizer-ts](https://github.com/intel/Wasmnizer-ts) implements the [WasmGC proposal](https://github.com/WebAssembly/gc), but wasm runtime in nearcore doesn't support it.