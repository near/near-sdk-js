export function signerAccountId() {
    env.signer_account_id(0)
    return env.read_register(0)
}
