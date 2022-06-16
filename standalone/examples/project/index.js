import {dropWhile} from 'lodash-es'
import {users} from './user.js'

export function hello() {
    let activeUser = dropWhile(users, function(o) { return !o.active; })[0].user;
    env.log(`Hello ${activeUser} from NEAR!`)
}
