export function storage_access() {
    env.jsvm_storage_write("key", "value")
    env.jsvm_js_contract_name(0)
    let contract_name = env.read_register(0)
    let actual_key = contract_name + "/state/" + "key"
    env.storage_read(actual_key, 1)
    let value = env.read_register(1)
    if (value != "value") {
        env.panic()
    }
    env.log(`written to ${actual_key} ${value}`)
}