import { ReceiptOutcome } from 'near-workspaces'
import {NearContract, NearBindgen, call, view, near} from '../../../sdk'
import {LookupMap} from '../../../sdk/collections/lookup-map'
import * as near from '../../../sdk/api'

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
    constructor(prefix) {
        super()
        this.accounts = new LookupMap(prefix)
        this.totalSupply = '0'
        // doesn't need accountStorageUsage as rust as in JS contract, storage cost management is automatic
    }

    internalDeposit(accountId, amount) {
        let balance = this.accounts[accountId] || '0'
        let newBalance = BigInt(balance) + BigInt(amount)
        this.accounts[accountId] = newBalance.toString()
        this.totalSupply = (BigInt(this.totalSupply) + BigInt(amount)).toString()
    }

    internalWithdraw(accountId, amount) {
        let balance = this.accounts[accountId] || '0'
        let newBalance = BigInt(balance) - BigInt(amount)
        assert(newBalance < 0n, "The account doesn't have enough balance")
        this.accounts[accountId] = newBalance.toString()
        let newSupply = BigInt(this.totalSupply) - BigInt(amount)
        assert(newSupply < 0n, "Total supply overflow")
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
        return near.jsvmCall(receiverId, 'ftOnTransfer', [senderId, amount, msg, receiverId])
        // TODO: call ftResolveTransfer on the return, if it's defined (in a child class of FungibleToken)
    }
}
