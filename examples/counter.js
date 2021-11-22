function get_num() {
    hasRead = env.storage_read("a", 0)
    if (hasRead != 0)
        env.value_return(env.read_register(0))
    else
        env.value_return("0")
}

function increment() {
    let n
    hasRead = env.storage_read("a", 0)
    if (hasRead != 0) {
        n = env.read_register(0)
        n = Number(n)+1
    } else {
        n = 1
    }
    log_message = "Increased number to " + n
    env.storage_write("a", String(n))
    env.log(log_message)
}

function decrement() {
    let n
    hasRead = env.storage_read("a", 0)
    if (hasRead != 0) {
        n = env.read_register(0)
        n = Number(n)-1
    } else {
        n = 1
    }
    log_message = "Decreased number to " + n
    env.storage_write("a", String(n))
    env.log(log_message)
}

function reset() {
    env.storage_write("a", "0")
}