# Example Smart Contracts

This directory contains example smart contracts that demonstrate various functionalities using the `near-sdk-js`. These examples are meant to serve as a starting point for developers looking to build smart contracts on the NEAR blockchain using JavaScript/TypeScript.

## Overview

The example smart contracts provided here showcase different use cases and features of the NEAR blockchain. Each contract is written in JavaScript/TypeScript and demonstrates best practices for developing secure, efficient, and scalable smart contracts.

## Build and Test

To build and test the smart contracts in this directory, follow the steps below:

### Build

To build all the smart contracts, run the following command in the root of the project:

```
pnpm build
```

### Test

To run the tests for the example smart contracts, use the following command:

```
pnpm test
```

This command will execute the test suites associated with each smart contract, ensuring that they function as expected.

## List of Example Smart Contracts

The following smart contracts demonstrate various capabilities of the NEAR blockchain, using JavaScript/TypeScript.
Each example highlights specific features and serves as a practical guide for developers.

**[basic-updates](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/basic-updates)**<br />
A simple smart contract that can make basic state updates.

**[counter](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/counter)**<br />
A simple smart contract that demonstrates state management by implementing a basic counter with increment and decrement functionalities.

**[cross-contract](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/cross-contract)**<br />
A smart contract that demonstrates how to perform cross-contract calls on the NEAR blockchain, including querying external contracts to manage on-chain interactions.

**[fungible-token](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/fungible-token)**<br />
Example implementation of a Fungible Token (FT) contract using the [near-contract-standards](https://github.com/near/near-sdk-js/tree/develop/packages/near-contract-standards), including `storage_management`.

**[non-fungible-token](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/non-fungible-token)**<br />
Example implementation of a Non-Fungible Token (NFT) contract using the [near-contract-standards](https://github.com/near/near-sdk-js/tree/develop/packages/near-contract-standards).

**[programmatic-updates](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/programmatic-updates)**<br />
Contracts showcasing how contracts can evolve while maintaining certain logic from previous versions.

**[state-migration](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/state-migration)**<br />
A smart contract that demonstrates how to handle state migration in a NEAR smart contract.

**[status-message](https://github.com/near/near-sdk-js/tree/documentation-improvements/examples/src/status-message)**<br />
Smart contracts that record the status messages of the accounts that call the contracts.

## Contributing

If you find any issues or have suggestions for improvement, feel free to open an issue or submit a pull request. Contributions are welcome!
