# Example of multiple module and npm dependencies

NEAR-SDK-JS supports (by QuickJS) contracts with most ES2020 features. So if a npm package doesn't use nodejs/browser specific feature, it usually can be imported and used in writing contracts.

This repo is an example with multiple modules and with an npm dependency: lodash.

## Build
```
cd ../../sdk && npm i
cd examples/project
npm i
npm run build
```

The result contract is `build/project.base64`. It can be tested with a near node

## Test

```
cd /path/to/project
cd near-workspaces
npm i
npm run test
```
