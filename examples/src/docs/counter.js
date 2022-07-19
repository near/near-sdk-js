//! This contract implements simple counter backed by storage on blockchain.
//!
//! The contract provides methods to [increment] / [decrement] counter and
//! get it's current value [get_num] or [reset].
import { NearContract, NearBindgen, near, call, view } from 'near-sdk-js'

@NearBindgen
class Counter extends NearContract {
    constructor() {
        super()
        this.val = 0
    }

    @call
    /// Public method: Increment the counter.
    increment() {
        this.val += 1;
        near.log(`Increased number to ${this.val}`)
    }

    @call
    /// Public method: Decrement the counter.
    decrement() {
        this.val -= 1;
        near.log(`Decreased number to ${this.val}`)
    }

    @call
    /// Public method - Reset to zero.
    reset() {
        this.val = 0;
        near.log(`Reset counter to zero`)
    }

    @view
    /// Public method: Returns the counter value.
    get_num() {
        return this.val
    }
}

