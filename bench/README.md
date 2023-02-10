# Gas and size benchmark compare to NEAR-SDK-RS

## Summary
NEAR-SDK-JS bundles a bytecode VM with the contract bytecode to a wasm file. Currently, the bytecode VM is the QuickJS runtime with interface to NEAR and the contract bytecode is compiled from JavaScript source code with QuickJS Compiler (QJSC).

This results in:
- Size of a minimal contract is 500K, which is also the size of the bytecode VM.
- Bytecode is more compact than wasm. Complex contract in JS adds less bytes to the equivalent wasm compiled from Rust, but due to the initial 500K size, the result contract is still bigger and within same order of magnitude: several hundred KB.
- For contract that bottlenecks at calling the host functions are using similar gas in JS and Rust.
- For contract that does a lot of computation in JS, the JS bytecode uses significantly more gas.
- For a real world contract, if it doesn't including complex logic in JavaScript, it's usually sufficient, consider the complexity of the near contract standards. 
- For more complex logic, We suggest to bench the most expensive contract call, including most complex path of cross contract calls, to determine whether it fits 300T Gas limit. 


## Detailed gas benchmark

### A minimal contract

- RS lowlevel minimal contract (2.5s)
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  2.43T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.00005T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  5.08T
- JS lowlevel minimal contract (4.5s)
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  7.07T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11132T
    -      WASM_INSTRUCTION :  4.53T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  9.72T

In the very minimal contract the JS adds about `1.8T` gas. The major difference is loading the QuickJS VM and near-sdk-js uses 4.53T Gas. The 500K contract loading just adds 0.1T Gas.

### A highlevel minimal contract (using nearbindgen)
- highlevel-minimal.ava › RS highlevel minimal contract
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  2.63T
    -      BASE :  0.79G
    -      CONTRACT_LOADING_BASE :  0.04G
    -      CONTRACT_LOADING_BYTES :  35.46G
    -      READ_CACHED_TRIE_NODE :  4.56G
    -      READ_MEMORY_BASE :  7.83G
    -      READ_MEMORY_BYTE :  0.04G
    -      STORAGE_READ_BASE :  56.36G
    -      STORAGE_READ_KEY_BYTE :  0.15G
    -      STORAGE_WRITE_BASE :  64.2G
    -      STORAGE_WRITE_KEY_BYTE :  0.35G
    -      TOUCHING_TRIE_NODE :  32.2G
    -      WASM_INSTRUCTION :  0.46G
    -      WRITE_MEMORY_BASE :  2.8G
    -      WRITE_MEMORY_BYTE :  0.04G
  -   Gas used to refund unused gas:  223.18G
  -   Total gas used:  5.28T
- highlevel-minimal.ava › JS highlevel minimal contract
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  8.39T
    -      BASE :  1.59G
    -      CONTRACT_LOADING_BASE :  0.04G
    -      CONTRACT_LOADING_BYTES :  112.03G
    -      READ_CACHED_TRIE_NODE :  6.84G
    -      READ_MEMORY_BASE :  7.83G
    -      READ_MEMORY_BYTE :  0.05G
    -      READ_REGISTER_BASE :  2.52G
    -      READ_REGISTER_BYTE :  0G
    -      STORAGE_READ_BASE :  56.36G
    -      STORAGE_READ_KEY_BYTE :  0.15G
    -      STORAGE_WRITE_BASE :  64.2G
    -      STORAGE_WRITE_KEY_BYTE :  0.35G
    -      STORAGE_WRITE_VALUE_BYTE :  0.06G
    -      TOUCHING_TRIE_NODE :  48.31G
    -      WASM_INSTRUCTION :  5.66T
    -      WRITE_MEMORY_BASE :  5.61G
    -      WRITE_MEMORY_BYTE :  0.05G
    -      WRITE_REGISTER_BASE :  2.87G
    -      WRITE_REGISTER_BYTE :  0.01G
  -   Gas used to refund unused gas:  223.18G
  -   Total gas used:  11.05T

JS `@NearBindgen` is more expensive, the major difference is in `WASM_INSTRUCTION`, because `@NearBindgen` does some class, object manipulation work, but Rust `near_bindgen` is a compile time code generation macro. Deduct the 4.5T loading VM and near-sdk-js, it's about 1T gas overhead.

### Low level API

- RS lowlevel API contract
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  2.53T
    -      BASE :  0.00026T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.00008T
    -      READ_MEMORY_BASE :  0.00522T
    -      READ_MEMORY_BYTE :  0.00008T
    -      STORAGE_WRITE_BASE :  0.0642T
    -      STORAGE_WRITE_KEY_BYTE :  0.0007T
    -      STORAGE_WRITE_VALUE_BYTE :  0.00031T
    -      TOUCHING_TRIE_NODE :  0.0322T
    -      WASM_INSTRUCTION :  0.00002T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  5.18T
- JS lowlevel API contract
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  7.8T
    -      BASE :  0.00026T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11119T
    -      READ_MEMORY_BASE :  0.00522T
    -      READ_MEMORY_BYTE :  0.00008T
    -      STORAGE_WRITE_BASE :  0.0642T
    -      STORAGE_WRITE_EVICTED_BYTE :  0.00032T
    -      STORAGE_WRITE_KEY_BYTE :  0.0007T
    -      STORAGE_WRITE_VALUE_BYTE :  0.00031T
    -      TOUCHING_TRIE_NODE :  0.09661T
    -      WASM_INSTRUCTION :  5.09T
    -      WRITE_REGISTER_BASE :  0.00287T
    -      WRITE_REGISTER_BYTE :  0.00004T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  10.45T
- JS lowlevel API contract, call many
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  8.47T
    -      BASE :  0.00265T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11119T
    -      READ_MEMORY_BASE :  0.0522T
    -      READ_MEMORY_BYTE :  0.00076T
    -      STORAGE_WRITE_BASE :  0.64197T
    -      STORAGE_WRITE_EVICTED_BYTE :  0.00289T
    -      STORAGE_WRITE_KEY_BYTE :  0.00705T
    -      STORAGE_WRITE_VALUE_BYTE :  0.0031T
    -      TOUCHING_TRIE_NODE :  0.04831T
    -      WASM_INSTRUCTION :  5.14T
    -      WRITE_REGISTER_BASE :  0.02579T
    -      WRITE_REGISTER_BYTE :  0.00034T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  11.12T

In this case, JS lowlevel API contract uses same gas in the storage write API part (`STORAGE_WRITE_BASE` / `STORAGE_WRITE_KEY_BYTE` / `STORAGE_WRITE_VALUE_BYTE` ). The major excessive gas is due to the overhead of initialize QuickJS VM and loading near-sdk-js. We can see this more obviously by calling storage write for 10 times ("call many tests" in above).

### Highlevel collection
- RS highlevel collection contract (8.6s)
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  3.32T
      -      BASE :  3.18G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  70.94G
      -      READ_CACHED_TRIE_NODE :  95.76G
      -      READ_MEMORY_BASE :  26.1G
      -      READ_MEMORY_BYTE :  1.87G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0.03G
      -      STORAGE_READ_BASE :  112.71G
      -      STORAGE_READ_KEY_BYTE :  3.44G
      -      STORAGE_READ_VALUE_BYTE :  0.19G
      -      STORAGE_WRITE_BASE :  256.79G
      -      STORAGE_WRITE_EVICTED_BYTE :  1.09G
      -      STORAGE_WRITE_KEY_BYTE :  9.23G
      -      STORAGE_WRITE_VALUE_BYTE :  7.75G
      -      TOUCHING_TRIE_NODE :  257.63G
      -      WASM_INSTRUCTION :  16.36G
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.74G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  1.1G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  5.97T
  - JS highlevel collection contract (9.6s)
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  10.06T
      -      BASE :  2.91G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  113.46G
      -      READ_CACHED_TRIE_NODE :  72.96G
      -      READ_MEMORY_BASE :  20.88G
      -      READ_MEMORY_BYTE :  2G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0.03G
      -      STORAGE_READ_BASE :  112.71G
      -      STORAGE_READ_KEY_BYTE :  3.31G
      -      STORAGE_READ_VALUE_BYTE :  0.53G
      -      STORAGE_WRITE_BASE :  192.59G
      -      STORAGE_WRITE_EVICTED_BYTE :  3.02G
      -      STORAGE_WRITE_KEY_BYTE :  7.96G
      -      STORAGE_WRITE_VALUE_BYTE :  9.49G
      -      TOUCHING_TRIE_NODE :  209.33G
      -      WASM_INSTRUCTION :  6.86T
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.9G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  1.55G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  12.71T

JS SDK's collection has about 1T overhead, deduct the 4.5T VM/near-sdk-js loading and 1T `@NearBindgen`. The gas used in actual writing the collection to storage is similar (`STORAGE_WRITE_BASE` / `STORAGE_WRITE_KEY_BYTE` / `STORAGE_WRITE_VALUE_BYTE` ).

### Computational expensive contract
  - JS expensive contract, iterate 20000 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  123.26T
      -      BASE :  1.85G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  112.09G
      -      READ_CACHED_TRIE_NODE :  4.56G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.07G
      -      READ_REGISTER_BASE :  2.52G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      STORAGE_WRITE_VALUE_BYTE :  0.06G
      -      TOUCHING_TRIE_NODE :  32.2G
      -      WASM_INSTRUCTION :  120.54T
      -      WRITE_MEMORY_BASE :  5.61G
      -      WRITE_MEMORY_BYTE :  0.07G
      -      WRITE_REGISTER_BASE :  2.87G
      -      WRITE_REGISTER_BYTE :  0.04G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  125.91T
  - RS expensive contract. iterate 20000 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  3.01T
      -      BASE :  1.85G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  67.77G
      -      READ_CACHED_TRIE_NODE :  6.84G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.06G
      -      READ_REGISTER_BASE :  2.52G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      TOUCHING_TRIE_NODE :  48.31G
      -      WASM_INSTRUCTION :  315.17G
      -      WRITE_MEMORY_BASE :  5.61G
      -      WRITE_MEMORY_BYTE :  0.07G
      -      WRITE_REGISTER_BASE :  2.87G
      -      WRITE_REGISTER_BYTE :  0.04G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  5.66T
  - RS expensive contract. iterate 10000 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  2.9T
      -      BASE :  2.38G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  67.77G
      -      READ_CACHED_TRIE_NODE :  13.68G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.06G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      TOUCHING_TRIE_NODE :  80.51G
      -      WASM_INSTRUCTION :  158.89G
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.07G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  0.04G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  5.56T
  - RS expensive contract. iterate 100 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  2.75T
      -      BASE :  2.38G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  67.77G
      -      READ_CACHED_TRIE_NODE :  13.68G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.05G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      TOUCHING_TRIE_NODE :  80.51G
      -      WASM_INSTRUCTION :  4.02G
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.07G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  0.03G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  5.4T
  - JS expensive contract, iterate 100 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  9.09T
      -      BASE :  2.38G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  112.09G
      -      READ_CACHED_TRIE_NODE :  13.68G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.06G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_READ_VALUE_BYTE :  0.01G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_EVICTED_BYTE :  0.06G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      STORAGE_WRITE_VALUE_BYTE :  0.06G
      -      TOUCHING_TRIE_NODE :  80.51G
      -      WASM_INSTRUCTION :  6.3T
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.07G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  0.05G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  11.75T
  - JS expensive contract, iterate 10000 times
    -   Gas used to convert transaction to receipt:  2.43T
    -   Gas used to execute the receipt (actual contract call):  65.94T
      -      BASE :  2.38G
      -      CONTRACT_LOADING_BASE :  0.04G
      -      CONTRACT_LOADING_BYTES :  112.09G
      -      READ_CACHED_TRIE_NODE :  13.68G
      -      READ_MEMORY_BASE :  10.44G
      -      READ_MEMORY_BYTE :  0.06G
      -      READ_REGISTER_BASE :  5.03G
      -      READ_REGISTER_BYTE :  0G
      -      STORAGE_READ_BASE :  56.36G
      -      STORAGE_READ_KEY_BYTE :  0.15G
      -      STORAGE_READ_VALUE_BYTE :  0.01G
      -      STORAGE_WRITE_BASE :  64.2G
      -      STORAGE_WRITE_EVICTED_BYTE :  0.06G
      -      STORAGE_WRITE_KEY_BYTE :  0.35G
      -      STORAGE_WRITE_VALUE_BYTE :  0.06G
      -      TOUCHING_TRIE_NODE :  80.51G
      -      WASM_INSTRUCTION :  63.15T
      -      WRITE_MEMORY_BASE :  8.41G
      -      WRITE_MEMORY_BYTE :  0.08G
      -      WRITE_REGISTER_BASE :  8.6G
      -      WRITE_REGISTER_BYTE :  0.06G
    -   Gas used to refund unused gas:  223.18G
    -   Total gas used:  68.59T

In this case, JS uses much more gas. Because JS Number is object and that's a lot of overhead compare to native integer arithmetic. It's even a lot of overhead compare to native float arithmetic. Also in QuickJS there's no JIT. If your contract does a lot of calculation or complex algorithm in JavaScript, it'd be better to do a similar benchmark.


### Deploy and cross contract call
- JS promise batch deploy contract and call
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  25.86T
    -      CREATE_ACCOUNT :  0.09961T
    -      DEPLOY_CONTRACT :  3.71T
    -      FUNCTION_CALL :  2.32T
    -      NEW_RECEIPT :  0.10806T
    -      TRANSFER :  0.11512T
    -      BASE :  0.00159T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.22386T
    -      PROMISE_RETURN :  0.00056T
    -      READ_MEMORY_BASE :  0.01566T
    -      READ_MEMORY_BYTE :  1.97T
    -      UTF8_DECODING_BASE :  0.00311T
    -      UTF8_DECODING_BYTE :  0.00525T
    -      WASM_INSTRUCTION :  14.86T
  -   Gas used to execute the cross contract call:  41.9T
    -      BASE :  0.00344T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11228T
    -      READ_MEMORY_BASE :  0.00261T
    -      READ_MEMORY_BYTE :  0.0005T
    -      READ_REGISTER_BASE :  0.01007T
    -      READ_REGISTER_BYTE :  0T
    -      WASM_INSTRUCTION :  5.47T
    -      WRITE_MEMORY_BASE :  0.01122T
    -      WRITE_MEMORY_BYTE :  0.00014T
    -      WRITE_REGISTER_BASE :  0.01146T
    -      WRITE_REGISTER_BYTE :  0.00019T
  -   Gas used to refund unused gas for cross contract call:  0.22318T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  70.63T

- RS promise batch deploy contract and call
  -   Gas used to convert transaction to receipt:  2.43T
  -   Gas used to execute the receipt (actual contract call):  10.89T
    -      CREATE_ACCOUNT :  0.09961T
    -      DEPLOY_CONTRACT :  3.71T
    -      FUNCTION_CALL :  2.32T
    -      NEW_RECEIPT :  0.10806T
    -      TRANSFER :  0.11512T
    -      BASE :  0.00159T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11283T
    -      PROMISE_RETURN :  0.00056T
    -      READ_MEMORY_BASE :  0.01566T
    -      READ_MEMORY_BYTE :  1.97T
    -      UTF8_DECODING_BASE :  0.00311T
    -      UTF8_DECODING_BYTE :  0.00525T
    -      WASM_INSTRUCTION :  0.00038T
  -   Gas used to execute the cross contract call:  41.9T
    -      BASE :  0.00344T
    -      CONTRACT_LOADING_BASE :  0.00004T
    -      CONTRACT_LOADING_BYTES :  0.11228T
    -      READ_MEMORY_BASE :  0.00261T
    -      READ_MEMORY_BYTE :  0.0005T
    -      READ_REGISTER_BASE :  0.01007T
    -      READ_REGISTER_BYTE :  0T
    -      WASM_INSTRUCTION :  5.47T
    -      WRITE_MEMORY_BASE :  0.01122T
    -      WRITE_MEMORY_BYTE :  0.00014T
    -      WRITE_REGISTER_BASE :  0.01146T
    -      WRITE_REGISTER_BYTE :  0.00019T
  -   Gas used to refund unused gas for cross contract call:  0.22318T
  -   Gas used to refund unused gas:  0.22318T
  -   Total gas used:  55.67T

In this test, we use a JS contract and RS contract to both deploy a JS contract and cross contract call this newly deployed contract. We can see the gas to do the cross contract call is the same. JS SDK has a `~10T` overhead to parse a `~500K` contract in byte. This is because JS, either represent code in Uint8Array or string has some overhead while rust compiler can directly turn it into data section in wasm. In practice, a 10T overhead for a one time contract deploy is not a big deal.

## Tips to do your own benchmark

If the above cases don't cover use case or you have a complex algorithm to implement in JavaScript, it's a good idea to benchmark your specific algorithm before choose near-sdk-js for your project.

You don't have to implement the exact algorithm to estimate the gas usage. Instead, you can find out the most expensive execution path of the algorithm, and estimate it by using the upper bound. For example, store the biggest possible objects into the collection and iterate for most possible times. Then goes to write the benchmark and the total gas cannot be more than 300T to be a valid contract. Also, if it has cross contract call, make sure the total gas, that's a sum of all cross contract calls, is less than 300T.

To Add your benchmark, write a one function contract of your most expensive operation. And write a test to call this function. If it doesn't involve cross contract call or promises, creating such test is simple. You can refer to `bench/src/expensive-calc.js` and `bench/__tests__/test-expensive-calc.ava.js` on how to write such test and print the gas breakdown. If it involves create promises or cross contract calls, printing the gas breakdown is a little bit more complex, you can refer to `bench/__tests__/test-deploy-contract.ava.js` for the recipe.

## Details of size benchmark
### JS Contract
```

-rwxrwxr-x 1 bo bo 1009K Feb  9 10:49 ./build/deploy-contract.wasm
-rwxrwxr-x 1 bo bo  506K Feb  8 12:11 ./build/expensive-calc.wasm
-rwxrwxr-x 1 bo bo  512K Feb  7 15:57 ./build/highlevel-collection.wasm
-rwxrwxr-x 1 bo bo  505K Feb  7 10:53 ./build/highlevel-minimal.wasm
-rwxrwxr-x 1 bo bo  502K Feb 10 11:32 ./build/lowlevel-api.wasm
-rwxrwxr-x 1 bo bo  502K Feb 10 11:47 ./build/lowlevel-minimal.wasm
```

### Rust Contract
```
-rwxrwxr-x 1 bo bo  509K Feb 10 10:02 ./res/deploy_contract.wasm
-rwxrwxr-x 1 bo bo  306K Feb  8 12:18 ./res/expensive_calc.wasm
-rwxrwxr-x 1 bo bo  320K Feb  8 11:26 ./res/highlevel_collection.wasm
-rwxrwxr-x 1 bo bo  160K Feb  7 10:51 ./res/highlevel_minimal.wasm
-rwxrwxr-x 1 bo bo   387 Feb  7 11:56 ./res/lowlevel_api.wasm
-rwxrwxr-x 1 bo bo   219 Feb  7 10:33 ./res/lowlevel_minimal.wasm
```
## Appendix
- Source code of the rust benchmark: https://github.com/near/sdk-rs-gas-benchmark
