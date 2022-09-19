import {PromiseOrValue, call, ExtContract, NearBindgen, near, Gas} from 'near-sdk-js';

// Prepaid gas for a single (not inclusive of recursion) `factorial` call.
const FACTORIAL_CALL_GAS: Gas = 20_000_000_000_000n;

// Prepaid gas for a single `factorial_mult` call.
const FACTORIAL_MULT_CALL_GAS: Gas = 10_000_000_000_000n;

const ext = ExtContract(class ExtCrossContract{
    factorial: (n: number) => PromiseOrValue<number>;
    factorial_mult: (n: number, cur: number) => number;
})

@NearBindgen({})
class ExtCrossContract{
    @call({})
    factorial(n: number): PromiseOrValue<number> {
        if (n <= 1) {
            return 1;
        }
        let accountId = near.currentAccountId();
        let prepaidGas = near.prepaidGas() - FACTORIAL_CALL_GAS;

        return ext.factorial(n-1, accountId, 0, prepaidGas - FACTORIAL_MULT_CALL_GAS)
            .then(ext.factorial_mult(n, accountId, 0, FACTORIAL_MULT_CALL_GAS))
    }
    @call({privateFunction: true, callbacks: ['cur']})
    factorial_mult(n: number, cur: number): number {
        near.log(`Received ${n} and ${cur}`);
        let result = n * cur;
        near.log(`Multiplied ${result}`);
        return result;
    }
}
