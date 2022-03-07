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

function annotation(target) {
  target.annotated = true;
}

@annotation
class MyClass {}

export function test_annotation() {
    env.log(MyClass.annotated)
}