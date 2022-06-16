export function call_host_function_with_incorrect_args() {
    // this should takes one argument
    env.current_account_id()
    env.log("aaa")
}

export function throw_error() {
    throw new Error('some js runtime error')
}