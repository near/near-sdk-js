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