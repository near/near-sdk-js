import { Worker } from 'near-workspaces';
import { readFile } from 'fs/promises'
import test from 'ava';

// TODO: make this function part of the npm package when it is available
function encodeCall(contract, method, args) {
    return Buffer.concat([Buffer.from(contract), Buffer.from([0]), Buffer.from(method), Buffer.from([0]), Buffer.from(JSON.stringify(args))])
}

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the jsvm contract.
    const jsvm = await root.createAndDeploy(
        root.getSubAccount('jsvm').accountId,
        './node_modules/near-sdk-js/jsvm/build/jsvm.wasm',
    );

    // Deploy fungible token contract
    const nftContract = await root.createSubAccount('fungible-token');
    let nftContractBase64 = (await readFile('build/non-fungible-token.base64')).toString();
    await nftContract.call(jsvm, 'deploy_js_contract', Buffer.from(nftContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await nftContract.call(jsvm, 'call_js_contract', encodeCall(nftContract.accountId, 'init', { owner_id: nftContract.accountId, owner_by_id_prefix: 'prefix' }), { attachedDeposit: '400000000000000000000000' });

    // Deploy token receiver contract
    const tokenReceiverContract = await root.createSubAccount('token-receiver');
    let tokenReceiverContractBase64 = (await readFile('build/test-token-receiver.base64')).toString();
    await tokenReceiverContract.call(jsvm, 'deploy_js_contract', Buffer.from(tokenReceiverContractBase64, 'base64'), { attachedDeposit: '400000000000000000000000' });
    await tokenReceiverContract.call(jsvm, 'call_js_contract', encodeCall(tokenReceiverContract.accountId, 'init', { nonFungibleTokenAccountId: nftContract.accountId }), { attachedDeposit: '400000000000000000000000' });

    // Mint an NFT
    let tokenId = 'my-cool-nft';
    await nftContract.call(jsvm, 'call_js_contract', encodeCall(nftContract.accountId, 'nftMint', { token_id: tokenId, token_owner_id: nftContract.accountId }), { attachedDeposit: '400000000000000000000000' });


    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = {
        root,
        jsvm,
        nftContract,
        tokenReceiverContract,
        tokenId,
        ali,
        bob,
    };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Owner has the NFT in the beginning', async t => {
    const { jsvm, nftContract, tokenId } = t.context.accounts;
    const result = await jsvm.view('view_js_contract', encodeCall(nftContract.accountId, 'nftToken', { token_id: tokenId }));
    t.deepEqual(result, { owner_id: nftContract.accountId, token_id: tokenId });
});

test('Simple transfer', async t => {
    const { jsvm, nftContract, tokenId, ali } = t.context.accounts;
    await nftContract.call(jsvm, 'call_js_contract', encodeCall(nftContract.accountId, 'nftTransfer', { receiver_id: ali.accountId, token_id: tokenId }), { attachedDeposit: '400000000000000000000000' });
    const result = await jsvm.view('view_js_contract', encodeCall(nftContract.accountId, 'nftToken', { token_id: tokenId }));
    t.deepEqual(result, { owner_id: ali.accountId, token_id: tokenId });
});

test('Transfer failures', async t => {
    const { jsvm, nftContract, tokenId, ali } = t.context.accounts;
    const error1 = await t.throwsAsync(() => ali.call(
        jsvm,
        'call_js_contract',
        encodeCall(nftContract.accountId, 'nftTransfer', { receiver_id: nftContract.accountId, token_id: 'non-existent-id' }),
        { attachedDeposit: '400000000000000000000000' }
    ));
    t.assert(error1.message.includes(`Token not found`));

    const error2 = await t.throwsAsync(() => ali.call(
        jsvm,
        'call_js_contract',
        encodeCall(nftContract.accountId, 'nftTransfer', { receiver_id: nftContract.accountId, token_id: tokenId }),
        { attachedDeposit: '400000000000000000000000' }
    ));
    t.assert(error2.message.includes(`Sender must be the current owner`));

    const error3 = await t.throwsAsync(() => nftContract.call(
        jsvm,
        'call_js_contract',
        encodeCall(nftContract.accountId, 'nftTransfer', { receiver_id: nftContract.accountId, token_id: tokenId }),
        { attachedDeposit: '400000000000000000000000' }
    ));
    t.assert(error3.message.includes(`Current and next owner must differ`));
});

test('Transfer call where receiver returns the token', async t => {
    const { jsvm, nftContract, tokenReceiverContract, tokenId } = t.context.accounts;
    await nftContract.call(
        jsvm,
        'call_js_contract',
        encodeCall(nftContract.accountId, 'nftTransferCall', { receiver_id: tokenReceiverContract.accountId, token_id: tokenId, approval_id: null, memo: null, msg: 'return-it-now' }),
        { attachedDeposit: '400000000000000000000000' }
    );
    const result = await jsvm.view('view_js_contract', encodeCall(nftContract.accountId, 'nftToken', { token_id: tokenId }));
    t.deepEqual(result, { owner_id: nftContract.accountId, token_id: tokenId });
});

test('Transfer call where receiver keeps the token', async t => {
    const { jsvm, nftContract, tokenReceiverContract, tokenId } = t.context.accounts;
    await nftContract.call(
        jsvm,
        'call_js_contract',
        encodeCall(nftContract.accountId, 'nftTransferCall', { receiver_id: tokenReceiverContract.accountId, token_id: tokenId, approval_id: null, memo: null, msg: 'keep-it-now' }),
        { attachedDeposit: '400000000000000000000000' }
    );
    const result = await jsvm.view('view_js_contract', encodeCall(nftContract.accountId, 'nftToken', { token_id: tokenId }));
    t.deepEqual(result, { owner_id: tokenReceiverContract.accountId, token_id: tokenId });
});
