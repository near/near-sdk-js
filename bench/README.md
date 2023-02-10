
https://github.com/near/sdk-rs-gas-benchmark
  ✔ RS lowlevel minimal contract (2.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  2.43T
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  0.05G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.08T
  ✔ JS lowlevel minimal contract (4.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  4.22T
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  108.95G
    ℹ    WASM_INSTRUCTION :  1.68T
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  6.87T

  ✔ highlevel-minimal.ava › RS highlevel minimal contract (2.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  2.63T
    ℹ    BASE :  0.79G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  35.46G
    ℹ    READ_CACHED_TRIE_NODE :  4.56G
    ℹ    READ_MEMORY_BASE :  7.83G
    ℹ    READ_MEMORY_BYTE :  0.04G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    TOUCHING_TRIE_NODE :  32.2G
    ℹ    WASM_INSTRUCTION :  0.46G
    ℹ    WRITE_MEMORY_BASE :  2.8G
    ℹ    WRITE_MEMORY_BYTE :  0.04G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.28T
  ✔ highlevel-minimal.ava › JS highlevel minimal contract (4.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  8.39T
    ℹ    BASE :  1.59G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  112.03G
    ℹ    READ_CACHED_TRIE_NODE :  6.84G
    ℹ    READ_MEMORY_BASE :  7.83G
    ℹ    READ_MEMORY_BYTE :  0.05G
    ℹ    READ_REGISTER_BASE :  2.52G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.06G
    ℹ    TOUCHING_TRIE_NODE :  48.31G
    ℹ    WASM_INSTRUCTION :  5.66T
    ℹ    WRITE_MEMORY_BASE :  5.61G
    ℹ    WRITE_MEMORY_BYTE :  0.05G
    ℹ    WRITE_REGISTER_BASE :  2.87G
    ℹ    WRITE_REGISTER_BYTE :  0.01G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  11.05T


 ✔ RS lowlevel API contract (2.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  2.53T
    ℹ    BASE :  0.26G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  0.08G
    ℹ    READ_MEMORY_BASE :  5.22G
    ℹ    READ_MEMORY_BYTE :  0.08G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.7G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.31G
    ℹ    TOUCHING_TRIE_NODE :  32.2G
    ℹ    WASM_INSTRUCTION :  0.02G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.18T
  ✔ JS lowlevel API contract (4.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  7.74T
    ℹ    BASE :  0.26G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  111.38G
    ℹ    READ_MEMORY_BASE :  5.22G
    ℹ    READ_MEMORY_BYTE :  0.08G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.7G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.31G
    ℹ    TOUCHING_TRIE_NODE :  48.31G
    ℹ    WASM_INSTRUCTION :  5.08T
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  10.39T

✔ RS highlevel collection contract (8.6s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  3.32T
    ℹ    BASE :  3.18G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  70.94G
    ℹ    READ_CACHED_TRIE_NODE :  95.76G
    ℹ    READ_MEMORY_BASE :  26.1G
    ℹ    READ_MEMORY_BYTE :  1.87G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0.03G
    ℹ    STORAGE_READ_BASE :  112.71G
    ℹ    STORAGE_READ_KEY_BYTE :  3.44G
    ℹ    STORAGE_READ_VALUE_BYTE :  0.19G
    ℹ    STORAGE_WRITE_BASE :  256.79G
    ℹ    STORAGE_WRITE_EVICTED_BYTE :  1.09G
    ℹ    STORAGE_WRITE_KEY_BYTE :  9.23G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  7.75G
    ℹ    TOUCHING_TRIE_NODE :  257.63G
    ℹ    WASM_INSTRUCTION :  16.36G
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.74G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  1.1G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.97T
  ✔ JS highlevel collection contract (9.6s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  10.06T
    ℹ    BASE :  2.91G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  113.46G
    ℹ    READ_CACHED_TRIE_NODE :  72.96G
    ℹ    READ_MEMORY_BASE :  20.88G
    ℹ    READ_MEMORY_BYTE :  2G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0.03G
    ℹ    STORAGE_READ_BASE :  112.71G
    ℹ    STORAGE_READ_KEY_BYTE :  3.31G
    ℹ    STORAGE_READ_VALUE_BYTE :  0.53G
    ℹ    STORAGE_WRITE_BASE :  192.59G
    ℹ    STORAGE_WRITE_EVICTED_BYTE :  3.02G
    ℹ    STORAGE_WRITE_KEY_BYTE :  7.96G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  9.49G
    ℹ    TOUCHING_TRIE_NODE :  209.33G
    ℹ    WASM_INSTRUCTION :  6.86T
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.9G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  1.55G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  12.71T


  ✔ JS expensive contract, iterate 20000 times (2.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  123.26T
    ℹ    BASE :  1.85G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  112.09G
    ℹ    READ_CACHED_TRIE_NODE :  4.56G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.07G
    ℹ    READ_REGISTER_BASE :  2.52G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.06G
    ℹ    TOUCHING_TRIE_NODE :  32.2G
    ℹ    WASM_INSTRUCTION :  120.54T
    ℹ    WRITE_MEMORY_BASE :  5.61G
    ℹ    WRITE_MEMORY_BYTE :  0.07G
    ℹ    WRITE_REGISTER_BASE :  2.87G
    ℹ    WRITE_REGISTER_BYTE :  0.04G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  125.91T
  ✔ RS expensive contract. iterate 20000 times (3.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  3.01T
    ℹ    BASE :  1.85G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  67.77G
    ℹ    READ_CACHED_TRIE_NODE :  6.84G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.06G
    ℹ    READ_REGISTER_BASE :  2.52G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    TOUCHING_TRIE_NODE :  48.31G
    ℹ    WASM_INSTRUCTION :  315.17G
    ℹ    WRITE_MEMORY_BASE :  5.61G
    ℹ    WRITE_MEMORY_BYTE :  0.07G
    ℹ    WRITE_REGISTER_BASE :  2.87G
    ℹ    WRITE_REGISTER_BYTE :  0.04G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.66T
  ✔ RS expensive contract. iterate 10000 times (5.3s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  2.9T
    ℹ    BASE :  2.38G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  67.77G
    ℹ    READ_CACHED_TRIE_NODE :  13.68G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.06G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    TOUCHING_TRIE_NODE :  80.51G
    ℹ    WASM_INSTRUCTION :  158.89G
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.07G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  0.04G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.56T
  ✔ RS expensive contract. iterate 100 times (8s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  2.75T
    ℹ    BASE :  2.38G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  67.77G
    ℹ    READ_CACHED_TRIE_NODE :  13.68G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.05G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    TOUCHING_TRIE_NODE :  80.51G
    ℹ    WASM_INSTRUCTION :  4.02G
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.07G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  0.03G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  5.4T
  ✔ JS expensive contract, iterate 100 times (10.1s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  9.09T
    ℹ    BASE :  2.38G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  112.09G
    ℹ    READ_CACHED_TRIE_NODE :  13.68G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.06G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_READ_VALUE_BYTE :  0.01G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_EVICTED_BYTE :  0.06G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.06G
    ℹ    TOUCHING_TRIE_NODE :  80.51G
    ℹ    WASM_INSTRUCTION :  6.3T
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.07G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  0.05G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  11.75T
  ✔ JS expensive contract, iterate 10000 times (13.7s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  65.94T
    ℹ    BASE :  2.38G
    ℹ    CONTRACT_LOADING_BASE :  0.04G
    ℹ    CONTRACT_LOADING_BYTES :  112.09G
    ℹ    READ_CACHED_TRIE_NODE :  13.68G
    ℹ    READ_MEMORY_BASE :  10.44G
    ℹ    READ_MEMORY_BYTE :  0.06G
    ℹ    READ_REGISTER_BASE :  5.03G
    ℹ    READ_REGISTER_BYTE :  0G
    ℹ    STORAGE_READ_BASE :  56.36G
    ℹ    STORAGE_READ_KEY_BYTE :  0.15G
    ℹ    STORAGE_READ_VALUE_BYTE :  0.01G
    ℹ    STORAGE_WRITE_BASE :  64.2G
    ℹ    STORAGE_WRITE_EVICTED_BYTE :  0.06G
    ℹ    STORAGE_WRITE_KEY_BYTE :  0.35G
    ℹ    STORAGE_WRITE_VALUE_BYTE :  0.06G
    ℹ    TOUCHING_TRIE_NODE :  80.51G
    ℹ    WASM_INSTRUCTION :  63.15T
    ℹ    WRITE_MEMORY_BASE :  8.41G
    ℹ    WRITE_MEMORY_BYTE :  0.08G
    ℹ    WRITE_REGISTER_BASE :  8.6G
    ℹ    WRITE_REGISTER_BYTE :  0.06G
    ℹ Gas used to refund unused gas:  223.18G
    ℹ Total gas used:  68.59T

-rwxrwxr-x 1 bo bo 109K Nov 23 17:16 ./examples/non-fungible-token/res/approval_receiver.wasm
-rwxrwxr-x 1 bo bo 248K Nov 23 17:16 ./examples/non-fungible-token/res/non_fungible_token.wasm
-rwxrwxr-x 1 bo bo 108K Nov 23 17:16 ./examples/non-fungible-token/res/token_receiver.wasm
-rwxrwxr-x 2 bo bo 109K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/approval_receiver.wasm
-rwxrwxr-x 2 bo bo 109K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/deps/approval_receiver.wasm
-rwxrwxr-x 2 bo bo 248K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/deps/non_fungible_token.wasm
-rwxrwxr-x 2 bo bo 108K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/deps/token_receiver.wasm
-rwxrwxr-x 2 bo bo 248K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/non_fungible_token.wasm
-rwxrwxr-x 2 bo bo 108K Nov 23 17:16 ./examples/non-fungible-token/target/wasm32-unknown-unknown/release/token_receiver.wasm
-rwxrwxr-x 1 bo bo 103K Feb  7 10:15 ./examples/status-message/res/status_message.wasm
-rwxrwxr-x 2 bo bo 124K Sep 27 09:36 ./examples/status-message/target/wasm32-unknown-unknown/release/deps/status_message.wasm
-rwxrwxr-x 2 bo bo 124K Sep 27 09:36 ./examples/status-message/target/wasm32-unknown-unknown/release/status_message.wasm
-rwxrwxr-x 2 bo bo 103K Feb  7 10:15 ./target/wasm32-unknown-unknown/release/deps/status_message.wasm
-rwxrwxr-x 2 bo bo 103K Feb  7 10:15 ./target/wasm32-unknown-unknown/release/status_message.wasm

-rwxrwxr-x 1 bo bo 306K Feb  8 12:18 expensive_calc.wasm
-rwxrwxr-x 1 bo bo 320K Feb  8 11:26 highlevel_collection.wasm
-rwxrwxr-x 1 bo bo 160K Feb  7 10:51 highlevel_minimal.wasm
-rwxrwxr-x 1 bo bo  387 Feb  7 11:56 lowlevel_api.wasm
-rwxrwxr-x 1 bo bo  219 Feb  7 10:33 lowlevel_minimal.wasm


  ✔ promise batch deploy contract and call (5.5s)
    ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  25.86T
    ℹ    CREATE_ACCOUNT :  0.09961T
    ℹ    DEPLOY_CONTRACT :  3.71T
    ℹ    FUNCTION_CALL :  2.32T
    ℹ    NEW_RECEIPT :  0.10806T
    ℹ    TRANSFER :  0.11512T
    ℹ    BASE :  0.00159T
    ℹ    CONTRACT_LOADING_BASE :  0.00004T
    ℹ    CONTRACT_LOADING_BYTES :  0.22386T
    ℹ    PROMISE_RETURN :  0.00056T
    ℹ    READ_MEMORY_BASE :  0.01566T
    ℹ    READ_MEMORY_BYTE :  1.97T
    ℹ    UTF8_DECODING_BASE :  0.00311T
    ℹ    UTF8_DECODING_BYTE :  0.00525T
    ℹ    WASM_INSTRUCTION :  14.86T
    ℹ Gas used to execute the cross contract call:  41.9T
    ℹ    BASE :  0.00344T
    ℹ    CONTRACT_LOADING_BASE :  0.00004T
    ℹ    CONTRACT_LOADING_BYTES :  0.11228T
    ℹ    READ_MEMORY_BASE :  0.00261T
    ℹ    READ_MEMORY_BYTE :  0.0005T
    ℹ    READ_REGISTER_BASE :  0.01007T
    ℹ    READ_REGISTER_BYTE :  0T
    ℹ    WASM_INSTRUCTION :  5.47T
    ℹ    WRITE_MEMORY_BASE :  0.01122T
    ℹ    WRITE_MEMORY_BYTE :  0.00014T
    ℹ    WRITE_REGISTER_BASE :  0.01146T
    ℹ    WRITE_REGISTER_BYTE :  0.00019T
    ℹ Gas used to refund unused gas for cross contract call:  0.22318T
    ℹ Gas used to refund unused gas:  0.22318T
    ℹ Total gas used:  70.63T

   ℹ Gas used to convert transaction to receipt:  2.43T
    ℹ Gas used to execute the receipt (actual contract call):  10.89T
    ℹ    CREATE_ACCOUNT :  0.09961T
    ℹ    DEPLOY_CONTRACT :  3.71T
    ℹ    FUNCTION_CALL :  2.32T
    ℹ    NEW_RECEIPT :  0.10806T
    ℹ    TRANSFER :  0.11512T
    ℹ    BASE :  0.00159T
    ℹ    CONTRACT_LOADING_BASE :  0.00004T
    ℹ    CONTRACT_LOADING_BYTES :  0.11283T
    ℹ    PROMISE_RETURN :  0.00056T
    ℹ    READ_MEMORY_BASE :  0.01566T
    ℹ    READ_MEMORY_BYTE :  1.97T
    ℹ    UTF8_DECODING_BASE :  0.00311T
    ℹ    UTF8_DECODING_BYTE :  0.00525T
    ℹ    WASM_INSTRUCTION :  0.00038T
    ℹ Gas used to execute the cross contract call:  41.9T
    ℹ    BASE :  0.00344T
    ℹ    CONTRACT_LOADING_BASE :  0.00004T
    ℹ    CONTRACT_LOADING_BYTES :  0.11228T
    ℹ    READ_MEMORY_BASE :  0.00261T
    ℹ    READ_MEMORY_BYTE :  0.0005T
    ℹ    READ_REGISTER_BASE :  0.01007T
    ℹ    READ_REGISTER_BYTE :  0T
    ℹ    WASM_INSTRUCTION :  5.47T
    ℹ    WRITE_MEMORY_BASE :  0.01122T
    ℹ    WRITE_MEMORY_BYTE :  0.00014T
    ℹ    WRITE_REGISTER_BASE :  0.01146T
    ℹ    WRITE_REGISTER_BYTE :  0.00019T
    ℹ Gas used to refund unused gas for cross contract call:  0.22318T
    ℹ Gas used to refund unused gas:  0.22318T
    ℹ Total gas used:  55.67T
  ─
