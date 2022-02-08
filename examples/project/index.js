import {dropWhile} from 'lodash-es'
import {users} from './user.js'
import {here_throw_error} from './error_happen.js'

export function hello() {
    let activeUser = dropWhile(users, function(o) { return !o.active; })[0].user;
    env.log(`Hello ${activeUser} from NEAR!`)
}

export function no() {
    here_throw_error()
}