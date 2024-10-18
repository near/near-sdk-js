# Gas and size benchmark compare to NEAR-SDK-RS

## Summary

NEAR-SDK-JS bundles a bytecode VM with the contract bytecode to a wasm file. Currently, the bytecode VM is the QuickJS runtime with an interface to NEAR, and the contract bytecode is compiled from JavaScript source code with QuickJS Compiler (QJSC).

This results in:

- Size of a minimal contract is `479K`, which is also the size of the bytecode VM.
- Bytecode is more compact than wasm. Complex contract in JS adds fewer bytes to the equivalent wasm compiled from Rust, but due to the initial `479K` size, the resulting contract is still bigger and within the same order of magnitude: several hundred KB.
- For contracts that bottleneck at calling the host functions, similar gas is used in JS and Rust.
- For contracts that do a lot of computation in JS, the JS bytecode uses significantly more gas.
- For a real-world contract, if it doesn't include complex logic in JavaScript, it's usually sufficient, considering the complexity of the NEAR contract standards.
- For more complex logic, we suggest benching the most expensive contract call, including the most complex path of cross-contract calls, to determine whether it fits the 300T gas limit.

## Detailed gas benchmark

---
### A Minimal Contract

| lowlevel minimal contract               | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.43T           | 7.07T               | 4.48T               | -36.6%           |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.00005T            | 0.11132T            | 0.10399T            | -6.57%           |
| WASM_INSTRUCTION                        | 0.00001T            | 4.53T               | 1.94T               | -57.19%          |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.08T               | 9.72T               | 7.13T               | -26.63%          |

In the very minimal contract, the optimized JS implementation adds about `2.05T` more gas compared to the Rust version. The significant difference is primarily due to the WASM_INSTRUCTION overhead associated with loading and executing the QuickJS VM, which accounts for `1.94T` gas in the optimized version.

<br />

---

### A Highlevel Minimal Contract (using `@nearbindgen`)

| highlevel-minimal.ava                   | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.63T           | 8.39T               | 5.26T               | -37.33%          |
| BASE                                    | 0.00079T            | 1.59T               | 0.00159T            | -99.9%           |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.03546T            | 0.11203T            | 0.1048T             | -6.45%           |
| READ_MEMORY_BASE                        | 0.00783T            | 7.83T               | 0.00783T            | -99.9%           |
| READ_MEMORY_BYTE                        | 0.00004T            | 0.05T               | 0.00005T            | -99.9%           |
| STORAGE_READ_BASE                       | 0.05636T            | 56.36T              | 0.05636T            | -99.9%           |
| STORAGE_READ_KEY_BYTE                   | 0.00015T            | 0.15T               | 0.00015T            | -99.9%           |
| STORAGE_WRITE_BASE                      | 0.0642T             | 64.2T               | 0.0642T             | -99.9%           |
| STORAGE_WRITE_KEY_BYTE                  | 0.00035T            | 0.35T               | 0.00035T            | -99.9%           |
| STORAGE_WRITE_VALUE_BYTE                | 0.00006T            | 0.06T               | 0.00006T            | -99.9%           |
| TOUCHING_TRIE_NODE                      | 0.0322T             | 48.31T              | 0.0322T             | -99.9%           |
| WASM_INSTRUCTION                        | 0.00052T            | 5.66T               | 2.56T               | -54.7%           |
| WRITE_MEMORY_BASE                       | 0.0028T             | 5.61T               | 0.00561T            | -99.9%           |
| WRITE_MEMORY_BYTE                       | 0.00004T            | 0.05T               | 0.00005T            | -99.9%           |
| WRITE_REGISTER_BASE                     | 0.00287T            | 2.87T               | 0.00287T            | -99.9%           |
| WRITE_REGISTER_BYTE                     | 0.00001T            | 0.01T               | 0.00001T            | -99.9%           |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.28T               | 11.05T              | 7.91T               | -28.4%           |

JS `@NearBindgen` is more expensive, the major difference is in `WASM_INSTRUCTION`, because `@NearBindgen` does some class, object manipulation work, but Rust `near_bindgen` is a compile-time code generation macro. Deduct the `4.5T` loading VM and near-sdk-js, it's about `1.04T` gas overhead.
The JavaScript implementation using `@NearBindgen` is more expensive, primarily due to the overhead in `WASM_INSTRUCTION`. This difference arises because `@NearBindgen` performs runtime class and object manipulation, whereas the Rust `near_bindgen` is a compile-time code generation macro, which is more efficient.

<br />

---

### Low-Level API

|                                         | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.53T           | 7.8T                | 5.19T               | -33.46%          |
| BASE                                    | 0.00026T            | 0.00026T            | 0.00026T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.00008T            | 0.11119T            | 0.10377T            | -6.68%           |
| READ_MEMORY_BASE                        | 0.00522T            | 0.00522T            | 0.00522T            | 0%               |
| READ_MEMORY_BYTE                        | 0.00008T            | 0.00008T            | 0.00008T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.0642T             | 0.0642T             | 0.0642T             | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.0007T             | 0.0007T             | 0.0007T             | 0%               |
| STORAGE_WRITE_VALUE_BYTE                | 0.00031T            | 0.00031T            | 0.00031T            | 0%               |
| TOUCHING_TRIE_NODE                      | 0.0322T             | 0.09661T            | 0.06441T            | -33.31%          |
| WASM_INSTRUCTION                        | 0.00002T            | 5.09T               | 2.52T               | -50.49%          |
| WRITE_REGISTER_BASE                     | 0.00287T            | 0.00287T            | 0.00287T            | 0%               |
| WRITE_REGISTER_BYTE                     | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.18T               | 10.45T              | 7.85T               | -24.89%          |

<br />

### Low-Level API (Call Many)

|                                         | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.53T           | 8.47T               | 5.85T               | -30.93%          |
| BASE                                    | 0.00026T            | 0.00265T            | 0.00265T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.00008T            | 0.11119T            | 0.10377T            | -6.68%           |
| READ_MEMORY_BASE                        | 0.00522T            | 0.0522T             | 0.0522T             | 0%               |
| READ_MEMORY_BYTE                        | 0.00008T            | 0.00076T            | 0.00076T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.0642T             | 0.64197T            | 0.64197T            | 0%               |
| STORAGE_WRITE_EVICTED_BYTE              | 0.00032T            | 0.00289T            | 0.00289T            | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.0007T             | 0.00705T            | 0.00705T            | 0%               |
| STORAGE_WRITE_VALUE_BYTE                | 0.00031T            | 0.0031T             | 0.0031T             | 0%               |
| TOUCHING_TRIE_NODE                      | 0.04831T            | 0.0322T             | 0.0322T             | 0%               |
| WASM_INSTRUCTION                        | 0.00002T            | 5.14T               | 2.55T               | -50.48%          |
| WRITE_REGISTER_BASE                     | 0.00287T            | 0.02579T            | 0.02579T            | 0%               |
| WRITE_REGISTER_BYTE                     | 0.00004T            | 0.00034T            | 0.00034T            | 0%               |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.18T               | 11.12T              | 8.51T               | -23.47%          |

In this case, the JS low-level API contract uses the same gas in the storage write API part (`STORAGE_WRITE_BASE` / `STORAGE_WRITE_KEY_BYTE` / `STORAGE_WRITE_VALUE_BYTE`). The major excessive gas is due to the overhead of initializing QuickJS VM and loading near-sdk-js. We can see this more obviously by calling storage write 10 times ("call many tests" in above).

<br />

---

### Highlevel collection

| Highlevel collection                    | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 3.32T           | 10.06T              | 6.86T               | -31.8%           |
| BASE                                    | 0.00318T            | 0.00291T            | 0.00291T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.07094T            | 0.11346T            | 0.10634T            | -6.28%           |
| READ_CACHED_TRIE_NODE                   | 0.05472T            | 0.0342T             | 0.0342T             | 0%               |
| READ_MEMORY_BASE                        | 0.0261T             | 0.02088T            | 0.02088T            | 0%               |
| READ_MEMORY_BYTE                        | 0.00187T            | 0.002T              | 0.002T              | 6.95%            |
| READ_REGISTER_BASE                      | 0.00503T            | 0.00503T            | 0.00503T            | 0%               |
| READ_REGISTER_BYTE                      | 0.00003T            | 0.00003T            | 0.00003T            | 0%               |
| STORAGE_READ_BASE                       | 0.11271T            | 0.11271T            | 0.11271T            | 0%               |
| STORAGE_READ_KEY_BYTE                   | 0.00344T            | 0.00331T            | 0.00331T            | -3.78%           |
| STORAGE_READ_VALUE_BYTE                 | 0.00019T            | 0.00053T            | 0.00053T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.25679T            | 0.19259T            | 0.19259T            | -24.97%          |
| STORAGE_WRITE_EVICTED_BYTE              | 0.00109T            | 0.00302T            | 0.00302T            | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.00923T            | 0.00796T            | 0.00796T            | -13.76%          |
| STORAGE_WRITE_VALUE_BYTE                | 0.00775T            | 0.00949T            | 0.00949T            | 22.45%           |
| TOUCHING_TRIE_NODE                      | 0.25763T            | 0.20933T            | 0.20933T            | -18.77%          |
| WASM_INSTRUCTION                        | 0.01848T            | 3.71T               | 3.71T               | 0%               |
| WRITE_MEMORY_BASE                       | 0.00841T            | 0.00841T            | 0.00841T            | 0%               |
| WRITE_MEMORY_BYTE                       | 0.00074T            | 0.0009T             | 0.0009T             | 21.62%           |
| WRITE_REGISTER_BASE                     | 0.0086T             | 0.0086T             | 0.0086T             | 0%               |
| WRITE_REGISTER_BYTE                     | 0.0011T             | 0.00155T            | 0.00155T            | 40.91%           |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.97T               | 12.71T              | 9.51T               | -25.16%          |

The JS SDK's collection has about `3.54T` overhead compared to the Rust version after deducting the `4.5T` VM/near-sdk-js loading and the `1.04T` `@NearBindgen` overhead. Note that this benchmarks the most complicated `UnorderedMap`, where gas usage is strictly greater than other collections. The gas used in actual writing the collection to storage is similar (`STORAGE_WRITE_BASE`, `STORAGE_WRITE_KEY_BYTE`, `STORAGE_WRITE_VALUE_BYTE`).

<br />

---

### Computational expensive contract

`20000 iterations`
|                                         | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 3.01T           | 123.26T             | 34.93T              | -71.65%          |
| BASE                                    | 0.00185T            | 0.00185T            | 0.00185T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.06777T            | 0.11209T            | 0.10483T            | -6.48%           |
| READ_MEMORY_BASE                        | 0.01044T            | 0.01044T            | 0.01044T            | 0%               |
| READ_MEMORY_BYTE                        | 0.00006T            | 0.00007T            | 0.00007T            | 0%               |
| READ_REGISTER_BASE                      | 0.00252T            | 0.00252T            | 0.00252T            | 0%               |
| STORAGE_READ_BASE                       | 0.05636T            | 0.05636T            | 0.05636T            | 0%               |
| STORAGE_READ_KEY_BYTE                   | 0.00015T            | 0.00015T            | 0.00015T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.0642T             | 0.0642T             | 0.0642T             | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.00035T            | 0.00035T            | 0.00035T            | 0%               |
| TOUCHING_TRIE_NODE                      | 0.0322T             | 0.04831T            | 0.04831T            | 0%               |
| WASM_INSTRUCTION                        | 0.33187T            | 120.54T             | 32.19T              | -73.3%           |
| WRITE_MEMORY_BASE                       | 0.00561T            | 0.00561T            | 0.00561T            | 0%               |
| WRITE_MEMORY_BYTE                       | 0.00007T            | 0.00007T            | 0.00007T            | 0%               |
| WRITE_REGISTER_BASE                     | 0.00287T            | 0.00287T            | 0.00287T            | 0%               |
| WRITE_REGISTER_BYTE                     | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.66T               | 125.91T             | 37.58T              | -70.15%          |

<br />

`10000 iterations`
|                                         | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.87T           | 65.94T              | 20.08T              | -69.54%          |
| BASE                                    | 0.00238T            | 0.00238T            | 0.00238T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.06777T            | 0.11209T            | 0.10483T            | -6.48%           |
| READ_CACHED_TRIE_NODE                   | 0.00228T            | 0.00228T            | 0.00228T            | 0%               |
| READ_MEMORY_BASE                        | 0.01044T            | 0.01044T            | 0.01044T            | 0%               |
| READ_MEMORY_BYTE                        | 0.00006T            | 0.00006T            | 0.00006T            | 0%               |
| READ_REGISTER_BASE                      | 0.00503T            | 0.00503T            | 0.00503T            | 0%               |
| READ_REGISTER_BYTE                      | 0T                  | 0T                  | 0T                  | 0%               |
| STORAGE_READ_BASE                       | 0.05636T            | 0.05636T            | 0.05636T            | 0%               |
| STORAGE_READ_KEY_BYTE                   | 0.00015T            | 0.00015T            | 0.00015T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.0642T             | 0.0642T             | 0.0642T             | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.00035T            | 0.00035T            | 0.00035T            | 0%               |
| TOUCHING_TRIE_NODE                      | 0.08051T            | 0.08051T            | 0.08051T            | 0%               |
| WASM_INSTRUCTION                        | 0.16738T            | 63.15T              | 17.37T              | -72.5%           |
| WRITE_MEMORY_BASE                       | 0.00841T            | 0.00841T            | 0.00841T            | 0%               |
| WRITE_MEMORY_BYTE                       | 0.00007T            | 0.00007T            | 0.00007T            | 0%               |
| WRITE_REGISTER_BASE                     | 0.0086T             | 0.0086T             | 0.0086T             | 0%               |
| WRITE_REGISTER_BYTE                     | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.55T               | 68.59T              | 22.73T              | -66.85%          |

<br />

`100 iterations`
|                                         | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 2.71T           | 9.09T               | 5.52T               | -39.23%          |
| BASE                                    | 0.00238T            | 0.00238T            | 0.00238T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.06777T            | 0.11209T            | 0.10483T            | -6.48%           |
| READ_CACHED_TRIE_NODE                   | 0.00228T            | 0.00228T            | 0.00228T            | 0%               |
| READ_MEMORY_BASE                        | 0.01044T            | 0.01044T            | 0.01044T            | 0%               |
| READ_MEMORY_BYTE                        | 0.00005T            | 0.00006T            | 0.00006T            | 0%               |
| READ_REGISTER_BASE                      | 0.00503T            | 0.00503T            | 0.00503T            | 0%               |
| READ_REGISTER_BYTE                      | 0T                  | 0T                  | 0T                  | 0%               |
| STORAGE_READ_BASE                       | 0.05636T            | 0.05636T            | 0.05636T            | 0%               |
| STORAGE_READ_KEY_BYTE                   | 0.00015T            | 0.00015T            | 0.00015T            | 0%               |
| STORAGE_WRITE_BASE                      | 0.0642T             | 0.0642T             | 0.0642T             | 0%               |
| STORAGE_WRITE_KEY_BYTE                  | 0.00035T            | 0.00035T            | 0.00035T            | 0%               |
| TOUCHING_TRIE_NODE                      | 0.08051T            | 0.08051T            | 0.08051T            | 0%               |
| WASM_INSTRUCTION                        | 0.00437T            | 6.3T                | 2.75T               | -56.35%          |
| WRITE_MEMORY_BASE                       | 0.00841T            | 0.00841T            | 0.00841T            | 0%               |
| WRITE_MEMORY_BYTE                       | 0.00007T            | 0.00007T            | 0.00007T            | 0%               |
| WRITE_REGISTER_BASE                     | 0.0086T             | 0.0086T             | 0.0086T             | 0%               |
| WRITE_REGISTER_BYTE                     | 0.00003T            | 0.00003T            | 0.00003T            | 0%               |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 5.36T               | 11.75T              | 8.17T               | -30.43%          |

<br />

In this case, JS uses much more gas. This is because the JS `Number` is an object, which has a lot of overhead compared to native integer arithmetic. It's even a lot of overhead compared to native float arithmetic. Also, in QuickJS, there's no JIT. If your contract does a lot of calculation or complex algorithm in JavaScript, it'd be better to do a similar benchmark.

<br />

---

### Promise batch deploy contract and call

| Deploy and cross-contract call          | Rust                | JS Before Opt       | JS After Opt        | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| Convert transaction to receipt          | 2.43T               | 2.43T               | 2.43T               | 0%               |
| Execute the receipt (actual contract call)  | 14.64T          | 25.86T              | 25.88T              | 0.08%            |
| CREATE_ACCOUNT                          | 3.85T               | 3.85T               | 3.85T               | 0%               |
| DEPLOY_CONTRACT_BASE                    | 0.18477T            | 0.18477T            | 0.18477T            | 0%               |
| DEPLOY_CONTRACT_BYTE                    | 3.53T               | 3.53T               | 3.28T               | -7.08%           |
| FUNCTION_CALL_BASE                      | 2.32T               | 2.32T               | 2.32T               | 0%               |
| FUNCTION_CALL_BYTE                      | 0.00005T            | 0.00005T            | 0.00005T            | 0%               |
| NEW_ACTION_RECEIPT                      | 0.10806T            | 0.10806T            | 0.10806T            | 0%               |
| TRANSFER                                | 0.11512T            | 0.11512T            | 0.11512T            | 0%               |
| CONTRACT_LOADING_BASE                   | 0.00004T            | 0.00004T            | 0.00004T            | 0%               |
| CONTRACT_LOADING_BYTES                  | 0.11283T            | 0.22386T            | 0.2085T             | -6.87%           |
| PROMISE_RETURN                          | 0.00056T            | 0.00056T            | 0.00056T            | 0%               |
| READ_MEMORY_BASE                        | 0.01566T            | 0.01566T            | 0.01566T            | 0%               |
| READ_MEMORY_BYTE                        | 1.97T               | 1.97T               | 1.83T               | -7.11%           |
| UTF8_DECODING_BASE                      | 0.00311T            | 0.00311T            | 0.00311T            | 0%               |
| UTF8_DECODING_BYTE                      | 0.00525T            | 0.00525T            | 0.00525T            | 0%               |
| WASM_INSTRUCTION                        | 0.00043T            | 11.54T              | 11.53T              | -0.09%           |
| Gas used to execute the cross-contract call | 45.58T          | 41.9T               | 40.62T              | -3.06%           |
| Refund unused gas                       | 0.22318T            | 0.22318T            | 0.22318T            | 0%               |
| Total gas used                          | 63.1T               | 70.63T              | 69.37T              | -1.79%           |

In this test, we use a JS contract and an RS contract to both deploy a JS contract and cross-contract call this newly deployed contract. We can see the gas used for the cross-contract call is the same. The JS SDK has a `~9.4T` overhead to parse a `~961K` contract in bytes. This is because JS, either representing code in Uint8Array or string, has some overhead, while the Rust compiler can directly turn it into the data section in WASM. In practice, a `~9.4T` overhead for a one-time contract deployment is not a big deal.

<br />

---

## Details of size benchmark

| File Name                               | Rust Contract (KB)  | JS Before Opt (KB)  | JS After Opt (KB)   | JS % Diff        |
| :-------------------------------------- | ------------------: | ------------------: | ------------------: | ---------------: |
| deploy-contract.wasm                    | 508.37              | 947.53              | 939.41              | -0.86%           |
| expensive-calc.wasm                     | 305.34              | 495.32              | 472.33              | -4.64%           |
| highlevel-collection.wasm               | 319.64              | 502.68              | 479.13              | -4.68%           |
| highlevel-minimal.wasm                  | 159.75              | 495.07              | 472.19              | -4.63%           |
| lowlevel-api.wasm                       | 0.38                | 471.08              | 467.53              | -0.75%           |
| lowlevel-minimal.wasm                   | 0.21                | 471.96              | 468.51              | -0.73%           |


<br />

---

## Appendix

- Source code of the rust benchmark: https://github.com/near/sdk-rs-gas-benchmark
