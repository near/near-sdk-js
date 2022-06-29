import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the nft contract.
    const nft = await root.createAndDeploy(
        root.getSubAccount('nft').accountId,
        './build/non-fungible-token.wasm',
    );

    // Init the contract
    await nft.call(nft, 'init', { owner_id: nft.accountId, owner_by_id_prefix: 'a' });

    // Deploy the tokenReceiver contract.
    const tokenReceiver = await root.createAndDeploy(
        root.getSubAccount('tokenreceiver').accountId,
        './build/non-fungible-token-receiver.wasm',
    );

    // Init the contract
    await tokenReceiver.call(tokenReceiver, 'init', {});

    // Mint an NFT
    let tokenId = 'my-cool-nft';
    await nft.call(nft, 'nftMint', { token_id: tokenId, token_owner_id: nft.accountId });


    // Create test accounts
    const ali = await root.createSubAccount('ali');
    const bob = await root.createSubAccount('bob');

    // Save state for test runs, it is unique for each test
    t.context.worker = worker;
    t.context.accounts = { root, nft, tokenReceiver, tokenId, ali, bob };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed tear down the worker:', error);
    });
});

test('Owner has the NFT in the beginning', async t => {
    const { nft, tokenId } = t.context.accounts;
    const result = await nft.view('nftToken', { token_id: tokenId });
    t.deepEqual(result, { owner_id: nft.accountId, token_id: tokenId });
});

test('Simple transfer', async t => {
    const { nft, tokenId, ali } = t.context.accounts;
    await nft.call(nft, 'nftTransfer', { receiver_id: ali.accountId, token_id: tokenId });
    const result = await nft.view('nftToken', { token_id: tokenId });
    t.deepEqual(result, { owner_id: ali.accountId, token_id: tokenId });
});

test('Transfer failures', async t => {
    const { nft, tokenId, ali } = t.context.accounts;
    const error1 = await t.throwsAsync(() => ali.call(nft, 'nftTransfer', { receiver_id: nft.accountId, token_id: 'non-existent-id' }));
    t.assert(error1.message.includes(`Token not found`));

    const error2 = await t.throwsAsync(() => ali.call(nft, 'nftTransfer', { receiver_id: nft.accountId, token_id: tokenId }));
    t.assert(error2.message.includes(`Sender must be the current owner`));

    const error3 = await t.throwsAsync(() => nft.call(nft, 'nftTransfer', { receiver_id: nft.accountId, token_id: tokenId }));
    t.assert(error3.message.includes(`Current and next owner must differ`));
});

test('Transfer call where receiver returns the token', async t => {
    const { nft, tokenReceiver, tokenId } = t.context.accounts;
    await nft.call(
        nft,
        'nftTransferCall', { receiver_id: tokenReceiver.accountId, token_id: tokenId, approval_id: null, memo: null, msg: 'return-it-now' },
        {
            gas: '40000000000000', //TODO: test if it works with standart gas
        }
    );
    const result = await nft.view('nftToken', { token_id: tokenId });
    t.deepEqual(result, { owner_id: nft.accountId, token_id: tokenId });
});

test('Transfer call where receiver keeps the token', async t => {
    const { nft, tokenReceiver, tokenId } = t.context.accounts;
    await nft.call(nft, 'nftTransferCall', { receiver_id: tokenReceiver.accountId, token_id: tokenId, approval_id: null, memo: null, msg: 'keep-it-now' });
    const result = await nft.view('nftToken', { token_id: tokenId });
    t.deepEqual(result, { owner_id: tokenReceiver.accountId, token_id: tokenId });
});
