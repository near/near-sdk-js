# NEAR-SDK-JS Tests

This tests the functionality of high level APIs of NEAR-SDK-JS. Currently, it directly tests all collections and indirectly tests all decorators, serialization/deserialization, utils, code generation and some important APIs. Majority of near-sdk-js can be seen as tested.

# Run tests
```
yarn
yarn build
yarn test
```

# Add a new test

Create a test contract that covers the API you want to test in `src/`. Add a build command in `build.sh`. Write ava test in `__tests__`.