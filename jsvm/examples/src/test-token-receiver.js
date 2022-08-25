import { NearContract, NearBindgen, call, near, assert } from 'near-sdk-js'

@NearBindgen
class NftContract extends NearContract {
    constructor({ nonFungibleTokenAccountId }) {
        super()
        this.nonFungibleTokenAccountId = nonFungibleTokenAccountId
    }

    @call
    nftOnTransfer({ senderId, previousOwnerId, tokenId, msg }) {
        assert(
            near.predecessorAccountId() === this.nonFungibleTokenAccountId,
            "Only supports the one non-fungible token contract"
        )
        if (msg === "return-it-now") {
            return true
        } else if (msg === "keep-it-now") {
            return false
        } else {
            throw Error("unsupported msg")
        }
    }
}
