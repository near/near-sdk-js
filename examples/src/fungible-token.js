import { NearBindgen, call, view, initialize, near, LookupMap, assert } from "near-sdk-js";

@NearBindgen({ initRequired: true })
export class FungibleToken {
  accounts = new LookupMap("a");
  accountRegistrants = new LookupMap("r");
  accountDeposits = new LookupMap("c");
  totalSupply = "0";

  @initialize({})
  init({ owner_id, total_supply }) {
    assert(BigInt(total_supply) > BigInt(0), "Total supply should be a positive number");
    this.totalSupply = total_supply;
    this.accounts.set(owner_id, this.totalSupply);
  }

  internalGetMaxAccountStorageUsage() {
    const initialStorageUsage = near.storageUsage();
    const tempAccountId = "a".repeat(64);
    this.accounts.set(tempAccountId, "0");
    const maxAccountStorageUsage = near.storageUsage() - initialStorageUsage;
    this.accounts.remove(tempAccountId);
    return maxAccountStorageUsage * BigInt(3); // we create an entry in 3 maps
  }

  internalRegisterAccount({ registrantAccountId, accountId, amountStr }) {
    assert(!this.accounts.containsKey(accountId), "Account is already registered");
    this.accounts.set(accountId, "0");
    this.accountRegistrants.set(accountId, registrantAccountId);
    this.accountDeposits.set(accountId, amountStr);
  }

  internalSendNEAR(receivingAccountId, amountBigInt) {
    assert(amountBigInt > BigInt("0"), "The amount should be a positive number");
    assert(receivingAccountId != near.currentAccountId(), "Can't transfer to the contract itself");
    assert(amountBigInt < near.accountBalance(), `Not enough balance ${near.accountBalance()} to cover transfer of ${amountBigInt} yoctoNEAR`);
    const transferPromiseId = near.promiseBatchCreate(receivingAccountId);
    near.promiseBatchActionTransfer(transferPromiseId, amountBigInt);
    near.promiseReturn(transferPromiseId);
  }

  internalGetBalance(accountId) {
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    return this.accounts.get(accountId);
  }

  internalDeposit(accountId, amount) {
    let balance = this.internalGetBalance(accountId);
    let newBalance = BigInt(balance) + BigInt(amount);
    this.accounts.set(accountId, newBalance.toString());
    let newSupply = BigInt(this.totalSupply) + BigInt(amount);
    this.totalSupply = newSupply.toString();
  }

  internalWithdraw(accountId, amount) {
    let balance = this.internalGetBalance(accountId);
    let newBalance = BigInt(balance) - BigInt(amount);
    assert(newBalance >= BigInt(0), "The account doesn't have enough balance");
    this.accounts.set(accountId, newBalance.toString());
    let newSupply = BigInt(this.totalSupply) - BigInt(amount);
    assert(newSupply >= BigInt(0), "Total supply overflow");
    this.totalSupply = newSupply.toString();
  }

  internalTransfer(senderId, receiverId, amount, memo = null) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    assert(BigInt(amount) > BigInt(0), "The amount should be a positive number");
    this.internalWithdraw(senderId, amount);
    this.internalDeposit(receiverId, amount);
  }

  @call({ payableFunction: true })
  storage_deposit({ account_id }) {
    const accountId = account_id || near.predecessorAccountId();
    let attachedDeposit = near.attachedDeposit();
    if (this.accounts.containsKey(accountId)) {
      if (attachedDeposit > 0) {
        this.internalSendNEAR(near.predecessorAccountId(), attachedDeposit);
        return { message: "Account is already registered, deposit refunded to predecessor" };
      }
      return { message: "Account is already registered" };
    }
    let storageCost = this.internalGetMaxAccountStorageUsage();
    if (attachedDeposit < storageCost) {
      this.internalSendNEAR(near.predecessorAccountId(), attachedDeposit);
      return { message: `Not enough attached deposit to cover storage cost. Required: ${storageCost.toString()}` };
    }
    this.internalRegisterAccount({
      registrantAccountId: near.predecessorAccountId(),
      accountId: accountId,
      amountStr: storageCost.toString(),
    });
    let refund = attachedDeposit - storageCost;
    if (refund > 0) {
      near.log("Storage registration refunding " + refund + " yoctoNEAR to " + near.predecessorAccountId());
      this.internalSendNEAR(near.predecessorAccountId(), refund);
    }
    return { message: `Account ${accountId} registered with storage deposit of ${storageCost.toString()}` };
  }

  @call({ payableFunction: true })
  ft_transfer({ receiver_id, amount, memo }) {
    assert(near.attachedDeposit() > BigInt(0), "Requires at least 1 yoctoNEAR to ensure signature");
    let senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    this.internalTransfer(senderId, receiver_id, amount, memo);
  }

  @call({ payableFunction: true })
  ft_transfer_call({ receiver_id, amount, memo, msg }) {
    assert(near.attachedDeposit() > BigInt(0), "Requires at least 1 yoctoNEAR to ensure signature");
    let senderId = near.predecessorAccountId();
    this.internalTransfer(senderId, receiver_id, amount, memo);
    const promise = near.promiseBatchCreate(receiver_id);
    const params = {
      sender_id: senderId,
      amount: amount,
      msg: msg,
      receiver_id: receiver_id,
    };
    near.log("Transfer call " + amount + " token from " + senderId + " to " + receiver_id + " with message " + msg);
    near.promiseBatchActionFunctionCall(promise, "ft_on_transfer", JSON.stringify(params), 0, 30000000000000);
    return near.promiseReturn();
  }

  @view({})
  ft_total_supply() {
    return this.totalSupply;
  }

  @view({})
  ft_balance_of({ account_id }) {
    return this.internalGetBalance(account_id);
  }
}
