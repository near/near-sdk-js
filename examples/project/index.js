import {dropWhile} from 'lodash-es'
import {users} from './user.js'
import {here_throw_error} from './error_happen.js'
import {NearContract, NearBindgen, call, view} from './sdk.js'

export function hello() {
    let activeUser = dropWhile(users, function(o) { return !o.active; })[0].user;
    env.log(`Hello ${activeUser} from NEAR!`)
}

export function no() {
    here_throw_error()
}

export function set_text() {
    env.jsvm_args(0)
    let text = env.read_register(0)
    env.jsvm_storage_write('text', text, 0)
}

export function get_text() {
    env.jsvm_storage_read('text', 0)
    let text = env.read_register(0)
    env.jsvm_value_return(text)
}

@NearBindgen
class MyContract extends NearContract {
    constructor(total) {
        super()
        this.name = 'hello'
        this.totalSupply = total
    }

    @call
    increaseTotal() {
        this.totalSupply += 1
        env.log("aaa")
        env.log(this.totalSupply)
    }

    @view
    getTotal() {
        return this.totalSupply
    }
}

let m 
export function init() {
    m = new MyContract(100)
}

let x = 1

export function testIncrease() {
    // let m = new MyContract(100)
    let m = MyContract.get()
    m.increaseTotal()
    env.log(m.getTotal())
}

// export function showTotal() {
//     env.log(m.getTotal())
// }