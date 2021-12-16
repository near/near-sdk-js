# Example of multiple module and npm dependencies

NEAR-SDK-JS supports (by QuickJS) contracts with most ES2020 features. So if a npm package doesn't use nodejs/browser specific feature, it usually can be imported and used in writing contracts.

This repo is an example with multiple modules and with an npm dependency: lodash.

## Build
```
npm i
npm run build
```

The result contract is `build/project.wasm`. It can be tested with neard and near-vm-runner-standalone (Note: only near-sdk-js branch of nearcore for now).