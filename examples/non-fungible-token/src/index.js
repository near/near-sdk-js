import { NearContract, NearBindgen, call, view, near, LookupMap } from 'near-sdk-js'

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

class Token {
    constructor(token_id, owner_id) {
        this.token_id = token_id;
        this.owner_id = owner_id;
    }
}

@NearBindgen
class NftContract extends NearContract {
    constructor(owner_id, owner_by_id_prefix) {
        super()
        this.owner_id = owner_id
        this.owner_by_id = new LookupMap(owner_by_id_prefix)
    }

    deserialize() {
        super.deserialize()
        this.owner_by_id = Object.assign(new LookupMap, this.owner_by_id)
    }

    internalTransfer(sender_id, receiver_id, token_id, approval_id, memo) {
        let owner_id = this.owner_by_id.get(token_id)

        assert(owner_id !== null, "Token not found")
        assert(sender_id === owner_id, "Sender must be the current owner")
        assert(owner_id !== receiver_id, "Current and next owner must differ")

        this.owner_by_id.set(token_id, receiver_id)

        return owner_id
    }

    @call
    nftTransfer(receiver_id, token_id, approval_id, memo) {
        let sender_id = near.predecessorAccountId()
        this.internalTransfer(sender_id, receiver_id, token_id, approval_id, memo)
    }

    @call
    nftTransferCall(receiver_id, token_id, approval_id, memo, msg) {
        let sender_id = near.predecessorAccountId()
        let old_owner_id = this.internalTransfer(sender_id, receiver_id, token_id, approval_id, memo)

        let onTransferRet = near.jsvmCall(receiver_id, 'nftOnTransfer', [sender_id, old_owner_id, token_id, msg])

        // NOTE: Arbitrary logic can be run here, as an example we return the token to the initial
        // owner if receiver's `nftOnTransfer` returns `true`
        if (onTransferRet) {
            let currentOwner = this.owner_by_id.get(token_id)
            if (currentOwner === null) {
                // The token was burned and doesn't exist anymore.
                return true
            } else if (currentOwner !== receiver_id) {
                // The token is not owned by the receiver anymore. Can't return it.
                return true
            } else {
                this.internalTransfer(receiver_id, sender_id, token_id, null, null)
                return false
            }
        } else {
            return true
        }
    }

    @call
    nftMint(token_id, token_owner_id, token_metadata) {
        let sender_id = near.predecessorAccountId()
        assert(sender_id === this.owner_id, "Unauthorized")
        assert(this.owner_by_id.get(token_id) === null, "Token ID must be unique")

        this.owner_by_id.set(token_id, token_owner_id)

        return new Token(token_id, token_owner_id)
    }

    @view
    nftToken(token_id) {
        let owner_id = this.owner_by_id.get(token_id)
        if (owner_id === null) {
            return null
        }

        return new Token(token_id, owner_id)
    }
}
