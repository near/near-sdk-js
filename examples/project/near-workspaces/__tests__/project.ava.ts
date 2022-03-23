import {Workspace} from 'near-workspaces-ava';
import {readFile} from 'fs/promises'

const workspace = Workspace.init(async ({root}) => {
    const alice = await root.createAccount('alice');
    const bob = await root.createAccount('bob');

    const jsvm = await root.createAndDeploy(
        'jsvm',
        'compiled-contracts/jsvm.wasm',
    );

    let contract_base64 = (await readFile('compiled-contracts/project.base64')).toString()
    await alice.call(jsvm, 'deploy_js_contract', Buffer.from(contract_base64, 'base64'), {attachedDeposit: '400000000000000000000000'});
    
    return {alice, bob, jsvm};
});

function encode_call(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(args)])
}

workspace.test('bob set text', async (test, {jsvm, alice, bob}) => {
    await bob.call(jsvm, 'call_js_contract', encode_call(alice.accountId, 'set_text', 'hello'), {attachedDeposit: '100000000000000000000000'});
    
    test.is(
        await jsvm.view('view_js_contract', encode_call(alice.accountId, 'get_text', '')),
        // await bob.call(jsvm, 'call_js_contract', encode_call(alice.accountId, 'get_text', '')),
        'hello'
    )
});