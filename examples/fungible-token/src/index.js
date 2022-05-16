import {NearContract, NearBindgen, call, view, near} from '../../../sdk'
import {LookupMap} from '../../../sdk/collections/lookup-map'

function assert(b, str)
{
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

@NearBindgen
class FungibleToken extends NearContract {
    constructor(prefix, totalSupply) {
        super()
        this.accounts = new LookupMap(prefix)
        this.totalSupply = totalSupply
        this.accounts.set(near.signerAccountId(), totalSupply)
        // don't need accountStorageUsage like rust in JS contract, storage deposit management is automatic in JSVM
    }

    deserialize() {
        super.deserialize()
        this.accounts = Object.assign(new LookupMap, this.accounts)
    }

    internalDeposit(accountId, amount) {
        let balance = this.accounts.get(accountId) || '0'
        let newBalance = BigInt(balance) + BigInt(amount)
        this.accounts.set(accountId, newBalance.toString())
        this.totalSupply = (BigInt(this.totalSupply) + BigInt(amount)).toString()
    }

    internalWithdraw(accountId, amount) {
        let balance = this.accounts.get(accountId) || '0'
        let newBalance = BigInt(balance) - BigInt(amount)
        assert(newBalance >= 0n, "The account doesn't have enough balance")
        this.accounts.set(accountId, newBalance.toString())
        let newSupply = BigInt(this.totalSupply) - BigInt(amount)
        assert(newSupply >= 0n, "Total supply overflow")
        this.totalSupply = newSupply.toString()
    }

    internalTransfer(senderId, recieverId, amount, memo) {
        assert(senderId != recieverId, "Sender and receiver should be different")
        let amountInt = BigInt(amount)
        assert(amountInt > 0n, "The amount should be a positive number")
        this.internalWithdraw(senderId, amount)
        this.internalDeposit(recieverId, amount)
    }

    @call
    ftTransfer(receiverId, amount, memo) {
        let senderId = near.predecessorAccountId()
        this.internalTransfer(senderId, receiverId, amount, memo)
    }

    @call
    ftTransferCall(receiverId, amount, memo, msg) {
        let senderId = near.predecessorAccountId()
        this.internalTransfer(senderId, receiverId, amount, memo)
        let onTransferRet = near.jsvmCall(receiverId, 'ftOnTransfer', [senderId, amount, msg, receiverId])
        // In JS, do not need a callback, ftResolveTransfer after ftOnTransfer Returns
        // If any logic after ftOnTransfer Returns is required, just do it on onTransferRet.
        return onTransferRet
    }

    @view
    ftTotalSupply() {
        return this.totalSupply
    }

    @view
    ftBalanceOf(accountId) {
        return this.accounts.get(accountId) || '0'
    }
}
