import { NearContract, NearBindgen, near, call, view } from 'near-sdk-js'
import { isUndefined } from 'lodash-es'

@NearBindgen
class Counter extends NearContract {
    constructor({ initial = 0 }) {
        super()
        this.count = initial
    }

    @call
    increase({ n = 1 }) {
        this.count += n
        near.log(`Counter increased to ${this.count}`)
    }

    @call
    decrease({ n }) {
        // you can use default argument `n=1` too
        // this is to illustrate a npm dependency: lodash can be used
        if (isUndefined(n)) {
            this.count -= 1
        } else {
            this.count -= n
        }
        near.log(`Counter decreased to ${this.count}`)
    }

    @view
    getCount() {
        return this.count
    }
}

