import { NearContract, NearBindgen, call, view, near } from '../../sdk'
import { LookupMap } from '../../sdk/collections/lookup-map'
import * as near from '../../../sdk/api'

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

    internalTransfer(sender_id, receiver_id, token_id, approval_id, memo) {
        let owner_id = this.owner_by_id.get(token_id) || near.panicUtf8("Token not found")

        assert(sender_id === owner_id)
        assert(owner_id !== receiver_id)

        this.owner_by_id.insert(token_id, receiver_id)

        return owner_id
    }

    @call
    nftTransfer(receiver_id, token_id, approval_id, memo) {
        assert(near.attachedDeposit() === 1)
        let sender_id = near.predecessorAccountId()
        internalTransfer(sender_id, receiver_id, token_id, approval_id, memo)
    }

    @call
    nftTransferCall(receiver_id, token_id, approval_id, memo) {
        assert(near.attachedDeposit() === 1)
        let sender_id = near.predecessorAccountId()
        let old_owner_id = internalTransfer(sender_id, receiver_id, token_id, approval_id, memo)

        return near.jsvmCall(receiverId, 'nftOnTransfer', [sender_id, old_owner_id, token_id, msg])
        // TODO: call nftResolveTransfer on the return, if it's defined (in a child class of FungibleToken)
    }

    @view
    nftToken(token_id) {
        let owner_id = this.owner_by_id.get(token_id)
        if (owner_id === null) {
            return null
        }

        return new Token(token_id, owner_id);
    }
}
