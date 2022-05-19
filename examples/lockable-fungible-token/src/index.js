import {
    NearContract,
    NearBindgen,
    call,
    view,
    near,
    LookupMap
} from 'near-sdk-js'

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

class Account {
    constructor(balance, allowances, lockedBalances) {
        this.balance = balance // Current unlocked balance
        this.allowances = allowances // Allowed account to the allowance amount
        this.lockedBalances = lockedBalances // Allowed account to locked balance
    }

    setAllowance(escrowAccountId, allowance) {
        if (allowance > 0) {
            this.allowances.set(escrowAccountId, allowance)
        } else if (allowance === 0) {
            this.allowances.delete(escrowAccountId)
        } else {
            throw Error("Allowance can't be negative")
        }
    }

    getAllowance(escrowAccountId) {
        return this.allowances.get(escrowAccountId) || 0
    }

    setLockedBalance(escrowAccountId, lockedBalance) {
        if (lockedBalance > 0) {
            this.lockedBalances.set(escrowAccountId, lockedBalance)
        } else if (lockedBalance === 0) {
            this.lockedBalances.delete(escrowAccountId)
        } else {
            throw Error("Locked balance cannot be negative")
        }
    }

    getLockedBalance(escrowAccountId) {
        return this.lockedBalances.get(escrowAccountId) || 0
    }

    totalBalance() {
        var totalLockedBalance = 0
        this.lockedBalances.forEach((v) => {
            totalLockedBalance += v
        })
        return this.balance + totalLockedBalance
    }
}

@NearBindgen
class LockableFungibleToken extends NearContract {
    constructor(prefix, totalSupply) {
        super()
        this.accounts = new LookupMap(prefix) // Account ID -> Account mapping
        this.totalSupply = totalSupply // Total supply of the all tokens
        let ownerId = near.signerAccountId()
        let ownerAccount = this.getAccount(ownerId)
        ownerAccount.balance = totalSupply
        this.setAccount(ownerId, ownerAccount)
    }

    deserialize() {
        super.deserialize()
        this.accounts = Object.assign(new LookupMap, this.accounts)
    }

    getAccount(ownerId) {
        let account = this.accounts.get(ownerId)
        if (account === null) {
            return new Account(0, new Map(), new Map())
        }
        let { balance, allowances, lockedBalances } = JSON.parse(account)
        return new Account(balance, new Map(Object.entries(allowances)), new Map(Object.entries(lockedBalances)))
    }

    setAccount(accountId, account) {
        this.accounts.set(accountId, JSON.stringify(account))
    }

    @call
    setAllowance(escrowAccountId, allowance) {
        let ownerId = near.predecessorAccountId()
        if (escrowAccountId === ownerId) {
            throw Error("Can't set allowance for yourself")
        }
        let account = this.getAccount(ownerId)
        let lockedBalance = account.getLockedBalance(escrowAccountId)
        if (lockedBalance > allowance) {
            throw Error("The new allowance can't be less than the amount of locked tokens")
        }

        account.setAllowance(escrowAccountId, allowance - lockedBalance)
        this.setAccount(ownerId, account)
    }

    @call
    lock(ownerId, lockAmount) {
        if (lockAmount === 0) {
            throw Error("Can't lock 0 tokens")
        }
        let escrowAccountId = near.predecessorAccountId()
        let account = this.getAccount(ownerId)

        // Checking and updating unlocked balance
        if (account.balance < lockAmount) {
            throw Error("Not enough unlocked balance")
        }
        account.balance -= lockAmount

        // If locking by escrow, need to check and update the allowance.
        if (escrowAccountId !== ownerId) {
            let allowance = account.getAllowance(escrowAccountId)
            if (allowance < lockAmount) {
                throw Error("Not enough allowance")
            }
            account.setAllowance(escrowAccountId, allowance - lockAmount)
        }

        // Updating total lock balance
        let lockedBalance = account.getLockedBalance(escrowAccountId)
        account.setLockedBalance(escrowAccountId, lockedBalance + lockAmount)

        this.setAccount(ownerId, account)
    }

    @call
    unlock(ownerId, unlockAmount) {
        if (unlockAmount <= 0) {
            throw Error("Can't unlock 0 or less tokens")
        }
        let escrowAccountId = near.predecessorAccountId()
        let account = this.getAccount(ownerId)

        // Checking and updating locked balance
        let lockedBalance = account.getLockedBalance(escrowAccountId)
        if (lockedBalance < unlockAmount) {
            throw Error("Not enough locked tokens")
        }
        account.setLockedBalance(escrowAccountId, lockedBalance - unlockAmount)

        // If unlocking by escrow, need to update allowance.
        if (escrowAccountId !== ownerId) {
            let allowance = account.getAllowance(escrowAccountId)
            account.setAllowance(escrowAccountId, allowance + unlockAmount)
        }

        // Updating unlocked balance
        account.balance += unlockAmount

        this.setAccount(ownerId, account)
    }

    @call
    transferFrom(ownerId, newOwnerId, amount) {
        if (amount <= 0) {
            throw Error("Can't transfer 0 or less tokens")
        }
        let escrowAccountId = near.predecessorAccountId()
        let account = this.getAccount(ownerId)

        // Checking and updating locked balance
        let lockedBalance = account.getLockedBalance(escrowAccountId)
        var remainingAmount
        if (lockedBalance >= amount) {
            account.setLockedBalance(escrowAccountId, lockedBalance - amount)
            remainingAmount = 0
        } else {
            account.setLockedBalance(escrowAccountId, 0)
            remainingAmount = amount - lockedBalance
        }

        // If there is remaining balance after the locked balance, we try to use unlocked tokens.
        if (remainingAmount > 0) {
            // Checking and updating unlocked balance
            if (account.balance < remainingAmount) {
                throw Error("Not enough unlocked balance")
            }
            account.balance -= remainingAmount

            // If transferring by escrow, need to check and update allowance.
            if (escrowAccountId !== ownerId) {
                let allowance = account.getAllowance(escrowAccountId)
                // Checking and updating unlocked balance
                if (allowance < remainingAmount) {
                    throw Error("Not enough allowance")
                }
                account.setAllowance(escrowAccountId, allowance - remainingAmount)
            }
        }

        this.setAccount(ownerId, account)

        // Deposit amount to the new owner
        let newAccount = this.getAccount(newOwnerId)
        newAccount.balance += amount
        this.setAccount(newOwnerId, newAccount)
    }

    @call
    transfer(newOwnerId, amount) {
        this.transferFrom(near.predecessorAccountId(), newOwnerId, amount)
    }

    @view
    getTotalSupply() {
        return this.totalSupply
    }

    @view
    getTotalBalance(ownerId) {
        return this.getAccount(ownerId).totalBalance()
    }

    @view
    getUnlockedBalance(ownerId) {
        return this.getAccount(ownerId).balance
    }

    @view
    getAllowance(ownerId, escrowAccountId) {
        return this.getAccount(ownerId).getAllowance(escrowAccountId)
    }

    @view
    getLockedBalance(ownerId, escrowAccountId) {
        return this.getAccount(ownerId).getLockedBalance(escrowAccountId)
    }
}
