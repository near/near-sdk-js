MAX_SUPPLY = 10
TOTAL_SUPPLY = 'c'
function mint_to() {
    let tokenId
    let hasRead = env.storage_read(TOTAL_SUPPLY, 0)
    if (hasRead != 0) {
        tokenId = Number(env.read_register(0))+1
    } else {
        tokenId = 1
    }
    if (tokenId > MAX_SUPPLY) {
        throw new Error('Maximum token limit reached')
    }
    env.input(0)
    let owner_id = env.read_register(0)
    env.storage_write(TOTAL_SUPPLY, tokenId.toString())
    env.storage_write('token_to_owner_' + tokenId, owner_id)
    env.log(`Minted NFT ${tokenId} to ${owner_id}`)
    env.value_return(tokenId.toString())
}