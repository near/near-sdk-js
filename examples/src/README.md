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

Below is a list of the smart contracts included in this directory

- `basic-updates` - A simple smart contract that makes state updates.
- `counter` - A simple smart contract that demonstrates state management by implementing a basic counter with increment and decrement functionalities.
- `cross-contract` - A smart contract that demonstrates how to perform cross-contract calls on the NEAR blockchain. This contract manages the assignment of a person on call by querying an external status message contract to check the availability of a given account.
- `fungible-token` - Example implementation of a Fungible Token contract which uses [near-contract-standards](https://github.com/near/near-sdk-js/tree/develop/packages/near-contract-standards) including `storage_management`.
- `non-fungible-token` - Example implementation of a NFT(Non-Fungible Token) contract which uses [near-contract-standards](https://github.com/near/near-sdk-js/tree/develop/packages/near-contract-standards).
- `programmatic-updates` - The `programmatic-update-after.js` contract is the updated version that follows `programmatic-update-before.js`. Contracts showcasing how contracts can evolve while maintaining certain logic from previous versions.
- `state-migration` - A smart contract that demonstrates how to handle state migration in a NEAR smart contract. This contract shows how to upgrade the structure of stored data while preserving the integrity of existing data.
- `status-message` - Smart Contracts that record the status messages of the accounts that call the contracts.

## Contributing

If you find any issues or have suggestions for improvement, feel free to open an issue or submit a pull request. Contributions are welcome!

