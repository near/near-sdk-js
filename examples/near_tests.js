function test_account_balance() {
    if (env.account_balance().toString() != "10000000000000000000000000") {
        env.panic()
    }
}

function test_account_locked_balance() {
    if (env.account_locked_balance().toString() != "0") {
        env.panic()
    }
}

function test_attached_deposit() {
    if (env.attached_deposit().toString() != "0") {
        env.panic()
    }  
}

function test_prepaid_gas() {
    if (env.prepaid_gas() != 1000000000000000000) {
        env.panic()
    }  
}

function test_used_gas() {
    if (env.used_gas() <= 0) {
        env.panic()
    }  
}

function test_register() {
    env.write_register(0, "\x00\x01\xff");
    if (env.read_register(0) != "\x00\x01\xff") {
        env.panic()
    }
    if (env.register_len(0) != 3) {
        env.panic()
    }
    if (env.register_len(0) !== 3n) {
        env.panic()
    }

    if (env.read_register(1) !== undefined) {
        env.panic()
    }
    if (env.register_len(2) !== 18446744073709551615n ){
        env.panic()
    }
}

function test_current_account_id() {
    env.current_account_id(0);
    if (env.read_register(0) != 'alice') {
        panic()
    }
}

function test_signer_account_id() {
    env.signer_account_id(0);
    if (env.read_register(0) != 'bob') {
        panic()
    }
}