import { Worker } from 'near-workspaces';
import test from 'ava';

test.beforeEach(async t => {
    const worker = await Worker.init();
    const root = worker.rootAccount;

    const parkingLot = await root.devDeploy(
        'build/parking-lot.wasm',
    );
    await parkingLot.call(parkingLot, 'init', {});

    const ali = await root.createSubAccount('ali');

    t.context.worker = worker;
    t.context.accounts = { root, parkingLot, ali };
});

test.afterEach(async t => {
    await t.context.worker.tearDown().catch(error => {
        console.log('Failed to tear down the worker:', error);
    });
});

test('No BMW in the beginning', async t => {
    const { parkingLot } = t.context.accounts;

    t.is(
        await parkingLot.view('getCarSpecs', { name: 'BMW' }),
        null
    );
});

test('Can get the car after adding it', async t => {
    const { ali, parkingLot } = t.context.accounts;

    const bmwSpecs = {
        id: 1,
        color: 'Black',
        price: 100500
    };
    
    ali.call(parkingLot, 'addCar', {
        name: 'BMW',
        specs: bmwSpecs
    });

    t.is(
        await parkingLot.view('getCarSpecs', { name: 'BMW' }), bmwSpecs
    );
});