export function hello() {
    env.jsvm_js_contract_name(0)
    let contract_name = env.read_register(0)
    env.jsvm_method_name(1)
    let method_name = env.read_register(1)
    env.jsvm_args(2)
    let args = env.read_register(2)
    env.log(contract_name)
    env.log(method_name)
    env.log(args)
}