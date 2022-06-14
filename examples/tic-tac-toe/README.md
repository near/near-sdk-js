# Tic-Tac-Toe contract in JavaScript

This is an equivalent JavaScript implementation of the Tic-Tac-Toe game. Every turn stored on chain. Build with [near-sdk-js](https://github.com/near/near-sdk-js) on [NEAR Blockchain](https://near.org).

Beta version build on top of existing client-server game on Vanilla JavaScript by [Colyseus](https://github.com/endel/colyseus-tic-tac-toe).

Most of the game logic hasn't changed at all, it is a pure Javascipt code but it deployed on a NEAR Blockchain. [Contract commit](https://github.com/zavodil/colyseus-tic-tac-toe/commit/b9a3127b988350248bba32c66970b1b12713102b?diff=unified)

Live demo: https://tictactoe.nearspace.info/

Current limitations:
- only 1 game at a time (one board for everyone)
- no rewards for winners (yet)
- no UI button to cancel game which ran out of time (call `onTimeoutEnds` method if move longs more than 100 seconds)
- JSVM storage deposit disabled to simplify web usage and avoid wallet redirect on every turn.

## Build the contract
```
npm i
npm run build
```

Result contract bytecode files will be stored in `build/tic-tac-toe.base64`. Intermediate JavaScript file can be found in `build/` folder. You'll only need the `base64` file to deploy contract to chain. The intermediate JavaScript file is for curious user and near-sdk-js developers to understand what code generation happened under the hood.

## Deploy the contract

Suppose JSVM contract was deployed to `jsvm.tictactoe.testnet`. Contract deployed to `contract.tictactoe.testnet`. 

```sh
export NEAR_ENV=testnet
export CONTRACT_ID=contract.tictactoe.testnet
export JSVM_ID=jsvm.tictactoe.testnet

near js deploy --accountId $CONTRACT_ID --base64File build/tic-tac-toe.base64 --deposit 0.2 --jsvm $JSVM_ID
```

## Initialize the contract

Now we need to initialize the contract after deployment is ready, call the `init` method which will execute `new State()` for the game class.
Call it with:

```sh
near js call $CONTRACT_ID init --deposit 0.1 --accountId $CONTRACT_ID --jsvm $JSVM_ID
```

## Call the contract
Under the root dir of near-sdk-js, call the `onJoin` methid to join the game and `playerAction` method to make a move

Examples:
```sh
near js call $CONTRACT_ID onJoin --accountId $ACCOUNT_1_ID --jsvm $JSVM_ID --deposit 0.05
near js call $CONTRACT_ID onJoin --accountId $ACCOUNT_2_ID --jsvm $JSVM_ID --deposit 0.05

near js call $CONTRACT_ID playerAction --args '{"data": {"x":0, "y": 0}}' --deposit 0.1 $ACCOUNT_1_ID --jsvm $JSVM_ID
near js call $CONTRACT_ID playerAction --args '{"data": {"x":1, "y": 2}}' --deposit 0.1 $ACCOUNT_2_ID --jsvm $JSVM_ID

near js call $CONTRACT_ID onTimeoutEnds --accountId $CONTRACT_ID --jsvm $JSVM_ID
```
