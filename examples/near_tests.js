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

function test_signer_account_pk() {
    env.signer_account_pk(0);
    if (env.read_register(0) != '\x00\x01\x02') {
        panic()
    }
}

function test_predecessor_account_id() {
    env.predecessor_account_id(0);
    if (env.read_register(0) != "carol") {
        panic()
    }
}

function test_input() {
    env.input(0);
    if (env.read_register(0) != 'aaaa') {
        panic()
    }
}

function test_block_index() {
    if (env.block_index() != 1) {
        panic()
    }
}

function test_block_timestamp() {
    if (env.block_timestamp() != 1586796191203000000n) {
        panic()
    }
}

function test_epoch_height() {
    if (env.epoch_height() != 1) {
        panic()
    }
}

function test_storage_usage() {
    if (env.storage_usage() != 100) {
        panic()
    }
}

function test_account_balance() {
    if (env.account_balance() != 10000000000000000000000000n) {
        env.panic()
    }
}

function test_account_locked_balance() {
    if (env.account_locked_balance() != 0) {
        env.panic()
    }
}

function test_attached_deposit() {
    if (env.attached_deposit() != 0) {
        env.panic()
    }
}

function test_prepaid_gas() {
    if (env.prepaid_gas() != 1000000000000000000) {
        env.panic()
    }
}

function test_used_gas() {
    if (env.used_gas() == 0 || env.used_gas() > env.prepaid_gas()) {
        env.panic()
    }
}

function test_random_seed() {
    env.random_seed(0)
    if (env.read_register(0) != '\x00\x01\x02') {
        env.panic()
    }
}

function array_to_bytes(a) {
    let bytes = ''
    for(let e of a) {
        bytes += String.fromCharCode(e)
    }
    return bytes
}

function test_sha256() {
    env.sha256("tesdsst", 0);
    if (env.read_register(0) != array_to_bytes([
        18, 176, 115, 156, 45, 100, 241, 132, 180, 134, 77, 42, 105, 111, 199, 127, 118, 112,
        92, 255, 88, 43, 83, 147, 122, 55, 26, 36, 42, 156, 160, 158,
    ])) {
        env.panic()
    }
}

function test_keccak256() {
    env.keccak256("tesdsst", 0)
    if (env.read_register(0) != array_to_bytes([
        104, 110, 58, 122, 230, 181, 215, 145, 231, 229, 49, 162, 123, 167, 177, 58, 26, 142,
        129, 173, 7, 37, 9, 26, 233, 115, 64, 102, 61, 85, 10, 159,
    ])) {
        env.panic()
    }
}

function test_keccak512() {
    env.keccak512("tesdsst", 0)
    if (env.read_register(0) != array_to_bytes([
        55, 134, 96, 137, 168, 122, 187, 95, 67, 76, 18, 122, 146, 11, 225, 106, 117, 194, 154,
        157, 48, 160, 90, 146, 104, 209, 118, 126, 222, 230, 200, 125, 48, 73, 197, 236, 123,
        173, 192, 197, 90, 153, 167, 121, 100, 88, 209, 240, 137, 86, 239, 41, 87, 128, 219,
        249, 136, 203, 220, 109, 46, 168, 234, 190
    ])) {
        env.panic()
    }
}

function test_ripemd160() {
    env.ripemd160("tesdsst", 0)
    if (env.read_register(0) != array_to_bytes([
        21, 102, 156, 115, 232, 3, 58, 215, 35, 84, 129, 30, 143, 86, 212, 104, 70, 97, 14, 225,
    ])) {
        env.panic()
    }
}

function test_ecrecover() {
    let hash = array_to_bytes([
        206,   6, 119, 187,  48, 186, 168, 207,
        6, 124, 136, 219, 152,  17, 244,  51,
       61,  19,  27, 248, 188, 241,  47, 231,
        6,  93,  33,  29, 206, 151,  16,   8
    ])
    let sign = array_to_bytes([
        144, 242, 123, 139,  72, 141, 176,  11,   0,  96, 103,
        150, 210, 152, 127, 106,  95,  89, 174,  98, 234,   5,
        239, 254, 132, 254, 245, 184, 176, 229,  73, 152,  74,
        105,  17,  57, 173,  87, 163, 240, 185,   6,  99, 118,
        115, 170,  47,  99, 209, 245,  92, 177, 166, 145, 153,
        212,   0, 158, 234,  35, 206, 173, 220, 147
    ])
    let v = 1
    let malleability_flag = 1
    let ret = env.ecrecover(hash, sign, v, malleability_flag, 0);
    if (ret != 1) {
        panic()
    }
    if (env.read_register(0) != array_to_bytes([
        227,  45, 244,  40, 101, 233, 113,  53, 172, 251, 101,
        243, 186, 231,  27, 220, 134, 244, 212, 145,  80, 173,
        106,  68,  11, 111,  21, 135, 129,   9, 136,  10,  10,
         43,  38, 103, 247, 231,  37, 206, 234, 112, 198, 115,
          9,  59, 246, 118,  99, 224,  49,  38,  35, 200, 224,
        145, 177,  60, 242, 192, 241,  30, 246,  82
    ])) {
        panic()
    }
}

function test_log() {
    env.log('\x00\x01\xff')
    env.log('水')
    // equivalent to above one because below is the utf-8 decoding of '水'
    env.log_utf8('\xe6\xb0\xb4')
    // panic, not valid utf 8 sequence
    // env.log_utf8('\x00\x01\xff')
    // equivalent to above one because below is the utf-16 (LE) decoding of '水'
    env.log_utf16('\x34\x6c')
    // panic, not valid utf 16 sequence
    // env.log_utf16('\xe6\xb0\xb4')
}

function test_promise_create() {
    env.promise_create('john', 'test_log', '', 0, Math.pow(10, 17))
}

function test_promise_then() {
    let promise_id = env.promise_create('john', 'test_log', '', 0, Math.pow(10, 17))
    env.promise_then(promise_id, 'john', 'test_log', '', 0, Math.pow(10, 17))
}

function test_promise_and() {
    let id1 = env.promise_create('john', 'test_log', '', 0, Math.pow(10, 17))
    let id2 = env.promise_create('john', 'test_log', '', 0, Math.pow(10, 17))
    env.promise_and(id1, id2)
}

function test_promise_batch_create() {
    env.promise_batch_create('john')
}

function test_promise_batch_then() {
    let promise_id = env.promise_batch_create('john')
    env.promise_batch_then(promise_id, 'doe')
}