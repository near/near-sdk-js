import { NearBindgen, call, view, initialize, near, LookupMap, assert, validateAccountId } from "near-sdk-js";

@NearBindgen({ requireInit: true })
export class FungibleToken {
  accounts: LookupMap<string> = new LookupMap("a");
  accountRegistrants: LookupMap<string> = new LookupMap("r");
  accountDeposits: LookupMap<string> = new LookupMap("c");
  totalSupply = "0";

  @initialize({})
  init({ owner_id, total_supply }: { owner_id: string, total_supply: string }) {
    Assertions.isLeftGreaterThanRight(total_supply, 0);
    validateAccountId(owner_id);
    this.totalSupply = total_supply;
    this.accounts.set(owner_id, this.totalSupply);
  }

  internalGetMaxAccountStorageUsage(): bigint {
    const initialStorageUsage = near.storageUsage();
    const tempAccountId = "a".repeat(64);
    this.accounts.set(tempAccountId, "0");
    const maxAccountStorageUsage = near.storageUsage() - initialStorageUsage;
    this.accounts.remove(tempAccountId);
    return maxAccountStorageUsage * BigInt(3); // we create an entry in 3 maps
  }

  internalRegisterAccount({ registrantAccountId, accountId, amountStr }: { registrantAccountId: string, accountId: string, amountStr: string }) {
    assert(!this.accounts.containsKey(accountId), "Account is already registered");
    this.accounts.set(accountId, "0");
    this.accountRegistrants.set(accountId, registrantAccountId);
    this.accountDeposits.set(accountId, amountStr);
  }

  internalSendNEAR(receivingAccountId: string, amountBigInt: bigint) {
    Assertions.isLeftGreaterThanRight(amountBigInt, 0);
    Assertions.isLeftGreaterThanRight(near.accountBalance(), amountBigInt, `Not enough balance ${near.accountBalance()} to send ${amountBigInt}`);
    const promise = near.promiseBatchCreate(receivingAccountId);
    near.promiseBatchActionTransfer(promise, amountBigInt);
    near.promiseReturn(promise);
  }

  internalGetBalance(accountId: string): string {
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    return this.accounts.get(accountId);
  }

  internalDeposit(accountId: string, amount: string) {
    let balance = this.internalGetBalance(accountId);
    let newBalance = BigInt(balance) + BigInt(amount);
    this.accounts.set(accountId, newBalance.toString());
    let newSupply = BigInt(this.totalSupply) + BigInt(amount);
    this.totalSupply = newSupply.toString();
  }

  internalWithdraw(accountId: string, amount: string) {
    let balance = this.internalGetBalance(accountId);
    let newBalance = BigInt(balance) - BigInt(amount);
    let newSupply = BigInt(this.totalSupply) - BigInt(amount);
    Assertions.isLeftGreaterThanRight(newBalance, -1, "The account doesn't have enough balance");
    Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
    this.accounts.set(accountId, newBalance.toString());
    this.totalSupply = newSupply.toString();
  }

  internalTransfer(senderId: string, receiverId: string, amount: string, _memo: string = null) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, 0);
    this.internalWithdraw(senderId, amount);
    this.internalDeposit(receiverId, amount);
  }

  @call({ payableFunction: true })
  storage_deposit({ account_id }: { account_id: string }) {
    const accountId = account_id || near.predecessorAccountId();
    validateAccountId(accountId);
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
  ft_transfer({ receiver_id, amount, memo }: { receiver_id: string, amount: string, memo: string }) {
    Assertions.hasAtLeastOneAttachedYocto();
    let senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    this.internalTransfer(senderId, receiver_id, amount, memo);
  }

  @call({ payableFunction: true })
  ft_transfer_call({ receiver_id, amount, memo, msg }: { receiver_id: string, amount: string, memo: string, msg: string }) {
    Assertions.hasAtLeastOneAttachedYocto();
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
    return near.promiseReturn(promise);
  }

  @view({})
  ft_total_supply() {
    return this.totalSupply;
  }

  @view({})
  ft_balance_of({ account_id }: { account_id: string }) {
    validateAccountId(account_id);
    return this.internalGetBalance(account_id);
  }
}

class Assertions {
  static hasAtLeastOneAttachedYocto() {
    assert(near.attachedDeposit() > BigInt(0), "Requires at least 1 yoctoNEAR to ensure signature");
  }

  static isLeftGreaterThanRight(left, right, message = null) {
    const msg = message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }
}
