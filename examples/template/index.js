import {NearContract, NearBindgen, call, view} from '../../sdk'

@NearBindgen
class Counter extends NearContract {
    constructor(initial=0) {
        super()
        this.count = initial
    }

    @call
    increase(n=1) {
        this.count += n
        env.log(`Counter increased to ${this.count}`)
    }

    @call
    decrease(n=1) {
        this.count -= n
        env.log(`Counter decreased to ${this.count}`)
    }

    @view
    getCount() {
        return this.count
    }

    @call
    series(...numbers) {
        for(let n of numbers) {
            env.log(`Counter at ${this.getCount()}`)
            if (n > 0) {
                env.log(`Counter increase ${n}`)
                this.increase(n)
            } else if (n < 0) {
                env.log(`Counter decrease ${-n}`)
                this.decrease(-n)
            }
        }
    }
}

