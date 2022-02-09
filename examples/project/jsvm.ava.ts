import {Workspace} from 'near-workspaces-ava';
import {readFile} from 'fs/promises'

const workspace = Workspace.init(async ({root}) => {
    const alice = await root.createAccount('alice');
    const bob = await root.createAccount('bob');

    const jsvm = await root.createAndDeploy(
        'jsvm',
        'compiled-contracts/jsvm.wasm',
    );

    return {alice, bob, jsvm};
});

workspace.test('root sets status', async (test, {jsvm, alice}) => {
    // Don't forget to `await` your calls!
    await alice.call(jsvm, 'deploy_js_contract', Buffer.from(await readFile('compiled-contracts/counter.base64'), 'base64'), {attachedDeposit: '100000000000000000000000'});
  
    // Assert that two things are identical using `test.is`
    // test.is(
    //     // Note that Root called the contract with `root.call(contract, ...)`, but
    //     // you view the contract with `contract.view`, since the account doing the
    //     // viewing is irrelevant.
    //     await contract.view('get_status', {account_id: root}),
    //     'lol',
    // );
});