export function storage_access() {
    let key = "key"
    env.jsvm_storage_write(key, "value", 0)
    env.jsvm_js_contract_name(0)
    let contract_name = env.read_register(0)
    let actual_key = contract_name + "/state/" + "key"
    env.storage_read(actual_key, 1)
    let value = env.read_register(1)
    if (value != "value") {
        env.panic()
    }
    env.log(`written to ${actual_key} ${value}`)
    env.jsvm_storage_read(key, 2)
    let value2 = env.read_register(2)
    if (value != value) {
        env.panic()
    }
    if (env.storage_has_key(actual_key) != 1) {
        env.panic()
    }
    if (env.jsvm_storage_has_key(key) != 1) {
        env.panic()
    }
    if (env.jsvm_storage_has_key("key2") != 0) {
        env.panic()
    }
    env.jsvm_storage_remove(key, 3)
    let value3 = env.read_register(3)
    if (value3 != value) {
        env.panic()
    }
    if (env.jsvm_storage_has_key(key) != 0) {
        env.panic()
    }
}

export function storage_increase() {
    let key = "key"
    env.jsvm_storage_write(key, "value", 0)
}

export function storage_decrease() {
    let key = "key"
    env.jsvm_storage_remove(key, 0)
}