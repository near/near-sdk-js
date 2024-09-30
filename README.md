# NEAR JavaScript SDK

<p>
  <a href="https://docs.near.org/tools/sdk" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-JS/TS-brightgreen.svg" />
  </a>
  <a href="https://www.npmjs.com/package/near-sdk-js" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/near-sdk-js.svg">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D14%20%3C16.6.0%20%7C%7C%20%3E16.6.0-blue.svg" />
  <a href="https://github.com/near/near-sdk-js/blob/develop/LICENSE" target="_blank">
    <img alt="License: LICENSE" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://github.com/near/near-sdk-js/blob/develop/LICENSE-APACHE" target="_blank">
    <img alt="License: LICENSE" src="https://img.shields.io/badge/License-Apache-yellow.svg" />
  </a>
</p>

A JavaScript library for writing NEAR smart contracts.

```typescript
import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class HelloNear {
  greeting: string = 'Hello';

  @view({}) // This method is read-only and can be called for free
  get_greeting(): string {
    return this.greeting;
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greeting({ greeting }: { greeting: string }): void {
    near.log(`Saving greeting ${greeting}`);
    this.greeting = greeting;
  }
}
```

See more in the [Anatomy of a Contract](https://docs.near.org/build/smart-contracts/anatomy/).

## Documentation

- [Learn how to use](https://github.com/near/create-near-app/tree/master/templates/contracts/ts)
- [Learn by example with AgorApp](https://agorapp.dev/catalog/all?difficulty=&chains=near)
- [Learn by example with NEAR Docs](https://docs.near.org/build/smart-contracts/quickstart)
- Check our [detailed examples and tutorials](https://docs.near.org/tutorials/welcome)
- Find [source code examples](https://github.com/near/near-sdk-js/tree/develop/examples) with common use cases
- Lookup available features in [API reference](https://near.github.io/near-sdk-js/)
- 🏠 Learn more about NEAR on our [Documentation website](https://docs.near.org/)
- Breaking features diff from [SDK 2.0.0 to 1.0.0](https://github.com/near/near-sdk-js/tree/develop/near-sdk-js@2.0.0-diff-1.0.0.md)

## Prerequisites

- node >=14 <16.6.0 || >16.6.0
- pnpm >=7

## Quick Start

Use [`create-near-app`](https://github.com/near/create-near-app) to quickly get started writing smart contracts in JavaScript on NEAR.

    npx create-near-app

This will scaffold a basic template for you 😎

## Contributing

If you are interested in contributing, please look at the [contributing guidelines](https://github.com/near/near-sdk-js/tree/develop/CONTRIBUTING.md).

 - [Report issues you encounter](https://github.com/near/near-sdk-js/issues) 🐞
 - [Provide suggestions or feedback](https://github.com/near/near-sdk-js/discussions) 💡
 - [Show us what you've built!](https://github.com/near/near-sdk-js/discussions/categories/show-and-tell) 💪

## License

This repository is distributed under the terms of both the [MIT license](https://github.com/near/near-sdk-js/blob/develop/LICENSE) and the [Apache License](https://github.com/near/near-sdk-js/blob/develop/LICENSE-APACHE) (Version 2.0).
See [LICENSE](https://github.com/near/near-sdk-js/tree/develop/LICENSE) and [LICENSE-APACHE](https://github.com/near/near-sdk-js/tree/develop/LICENSE-APACHE) for details.
