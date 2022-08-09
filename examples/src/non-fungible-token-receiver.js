import { NearContract, NearBindgen, call, near, assert } from 'near-sdk-js'

@NearBindgen
class NftContract extends NearContract {
    constructor({ nonFungibleTokenAccountId }) {
        super()
        this.nonFungibleTokenAccountId = nonFungibleTokenAccountId
    }

    @call
    nftOnTransfer({ senderId, previousOwnerId, tokenId, msg }) {
        near.log(`nftOnTransfer called, params: senderId: ${senderId}, previousOwnerId: ${previousOwnerId}, tokenId: ${tokenId}, msg: ${msg}`)
        assert(
            near.predecessorAccountId() === this.nonFungibleTokenAccountId,
            "Only supports the one non-fungible token contract"
        )
        if (msg === "return-it-now") {
            near.log(`Returning ${tokenId} to ${senderId}`)
            return false
        } else if (msg === "keep-it-now") {
            near.log(`Keep ${tokenId}`)
            return true
        } else {
            throw Error("unsupported msg")
        }
    }

    default() {
        return new NftContract({ nonFungibleTokenAccountId: '' })
    }
}
