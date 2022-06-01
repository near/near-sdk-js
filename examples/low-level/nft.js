import * as near from '../../src/api'

const MAX_SUPPLY = 10
const TOTAL_SUPPLY = 'c'

export function mint_to() {
    let tokenId = near.jsvmStorageRead(TOTAL_SUPPLY)
    tokenId = tokenId ? Number(tokenId) + 1 : 1
    if (tokenId > MAX_SUPPLY) {
        throw new Error('Maximum token limit reached')
    }
    let input = near.jsvmArgs();
    let ownerId = input['owner']
    near.jsvmStorageWrite(TOTAL_SUPPLY, tokenId.toString())
    near.jsvmStorageWrite('token_to_owner_' + tokenId, ownerId)
    near.log(`Minted NFT ${tokenId} to ${ownerId}`)
    // env.jsvm_value_return(tokenId.toString()) //TODO: Not implemented. Should we add it?
}
