# Example of multiple module and npm dependencies

NEAR-SDK-JS supports (by QuickJS) contracts with most ES2020 features. So if a npm package doesn't use nodejs/browser specific feature, it usually can be imported and used in writing contracts.

This repo is an example with multiple modules and with an npm dependency: lodash.

## Build
```
npm i
npm run build
```

The result contract is `build/project.base64`. It can be tested with a near node

## Test
Due to 1) a new near-workspaces has not yet release; 2) There is a bug in ava that causes near-workspaces-ava doesn't work when it's from `npm link`. Therefore some workaround is required to run workspace test of this project:

1. Clone `near-workspaces-js` (in any directory), checkout to `fix-view-arg-type` branch.
```
git clone https://github.com/near/workspaces-js.git
cd workspaces-js
git checkout fix-view-arg-type
```

2. Install and link
```
yarn
yarn build
cd packages/js
npm i
npm link
cd ../ava
npm i
npm link near-workspaces
npm link
```

3. Patch the ava, it has problem to work as a npm linked module. Open packages/ava/node_modules/ava/lib/api.js, change this line:
```
		const modulePath = resolveCwd.silent(name);
```
to:
```
		const modulePath = require.resolve(name);
```

4. Go back to this project directory, link the near-workspace-ava
```
cd /path/to/project
cd near-workspaces
npm link near-workspaces-ava
cd ..
```

5. Run test:
```
./test.sh
```
