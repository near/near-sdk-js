export function caller() {
    env.jsvm_call("jsvmtester.testnet", "callee", "", 0);
    let ret = env.read_register(0)
    env.log(ret)
}

export function callee() {
    env.jsvm_value_return("return by callee")
}