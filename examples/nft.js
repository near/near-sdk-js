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

/*
What we want, a user friendly high-level API like this one:
* class based
* arguments and return are auto converted from env.input() and env.value_return
* class properties are auto load and save to blockchain state
@Near
class MyNFT {
    constructor(maxSupply) {
        this.maxSupply = maxSupply
        this.totalSupply = 0
        this.tokenOwner = new LookupMap('token_to_owner_')
    }

    mintTo(owner) {
        if (this.totalSupply < this.maxSupply) {
            this.totalSupply++
        } else {
            throw new Error('Maximum token limit reached')
        }
        let tokenId = this.totalSupply;
        this.tokenOwner.insert(owner, tokenId);
        env.log(`Minted NFT ${tokenId} to ${ownerId}`)
        return tokenId
    }
}
*/