#!/usr/bin/env bash
## Run this script with `npm run build`

near-sdk-js build src/unordered-map.js build/unordered-map.base64
near-sdk-js build src/vector.js build/vector.base64
near-sdk-js build src/lookup-map.js build/lookup-map.base64
near-sdk-js build src/lookup-set.js build/lookup-set.base64
near-sdk-js build src/unordered-set.js build/unordered-set.base64
near-sdk-js build src/function-params.js build/function-params.base64
near-sdk-js build src/bytes.js build/bytes.base64