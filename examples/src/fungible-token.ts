import {
  NearBindgen,
  call,
  view,
  initialize,
  near,
  LookupMap,
  assert,
  validateAccountId,
  encode
} from "near-sdk-js";

@NearBindgen({ requireInit: true })
export class FungibleToken {
  accounts: LookupMap<bigint>;
  accountRegistrants: LookupMap<string>;
  accountDeposits: LookupMap<bigint>;
  totalSupply: bigint;

  constructor() {
    this.accounts = new LookupMap("a");
    this.accountRegistrants = new LookupMap("r");
    this.accountDeposits = new LookupMap("d");
    this.totalSupply = BigInt("0");
  }

  @initialize({})
  init({ owner_id, total_supply }: { owner_id: string; total_supply: string }) {
    Assertions.isLeftGreaterThanRight(total_supply, 0);
    validateAccountId(owner_id);
    this.totalSupply = BigInt(total_supply);
    this.accounts.set(owner_id, this.totalSupply);
  }

  internalGetAccountStorageUsage(accountLength: number): bigint {
    const initialStorageUsage = near.storageUsage();
    const tempAccountId = "a".repeat(64);
    this.accounts.set(tempAccountId, BigInt("0"));
    const len64StorageUsage = near.storageUsage() - initialStorageUsage;
    const len1StorageUsage = len64StorageUsage / BigInt(64);
    const lenAccountStorageUsage = len1StorageUsage * BigInt(accountLength);
    this.accounts.remove(tempAccountId);
    return lenAccountStorageUsage * BigInt(3); // we create an entry in 3 maps
  }

  internalRegisterAccount({
    registrantAccountId,
    accountId,
    amount,
  }: {
    registrantAccountId: string;
    accountId: string;
    amount: string;
  }) {
    assert(
      !this.accounts.containsKey(accountId),
      "Account is already registered"
    );
    this.accounts.set(accountId, BigInt("0"));
    this.accountRegistrants.set(accountId, registrantAccountId);
    this.accountDeposits.set(accountId, BigInt(amount));
  }

  internalSendNEAR(receivingAccountId: string, amount: bigint) {
    Assertions.isLeftGreaterThanRight(amount, 0);
    Assertions.isLeftGreaterThanRight(
      near.accountBalance(),
      amount,
      `Not enough balance ${near.accountBalance()} to send ${amount}`
    );
    const promise = near.promiseBatchCreate(receivingAccountId);
    near.promiseBatchActionTransfer(promise, amount);
    near.promiseReturn(promise);
  }

  internalGetBalance(accountId: string): string {
    assert(
      this.accounts.containsKey(accountId),
      `Account ${accountId} is not registered`
    );
    return this.accounts.get(accountId).toString();
  }

  internalDeposit(accountId: string, amount: string) {
    const balance = this.internalGetBalance(accountId);
    const newBalance = BigInt(balance) + BigInt(amount);
    this.accounts.set(accountId, newBalance);
    const newSupply = BigInt(this.totalSupply) + BigInt(amount);
    this.totalSupply = newSupply;
  }

  internalWithdraw(accountId: string, amount: string) {
    const balance = this.internalGetBalance(accountId);
    const newBalance = BigInt(balance) - BigInt(amount);
    const newSupply = BigInt(this.totalSupply) - BigInt(amount);
    Assertions.isLeftGreaterThanRight(
      newBalance,
      -1,
      "The account doesn't have enough balance"
    );
    Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
    this.accounts.set(accountId, newBalance);
    this.totalSupply = newSupply;
  }

  internalTransfer(
    senderId: string,
    receiverId: string,
    amount: string,
    _memo: string = null
  ) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, 0);
    this.internalWithdraw(senderId, amount);
    this.internalDeposit(receiverId, amount);
  }

  @call({ payableFunction: true })
  storage_deposit({ account_id }: { account_id: string }) {
    const accountId = account_id || near.predecessorAccountId();
    validateAccountId(accountId);
    const attachedDeposit = near.attachedDeposit();
    if (this.accounts.containsKey(accountId)) {
      if (attachedDeposit > 0) {
        this.internalSendNEAR(near.predecessorAccountId(), attachedDeposit);
        return {
          message:
            "Account is already registered, deposit refunded to predecessor",
        };
      }
      return { message: "Account is already registered" };
    }
    const storageCost = this.internalGetAccountStorageUsage(accountId.length);
    if (attachedDeposit < storageCost) {
      this.internalSendNEAR(near.predecessorAccountId(), attachedDeposit);
      return {
        message: `Not enough attached deposit to cover storage cost. Required: ${storageCost.toString()}`,
      };
    }
    this.internalRegisterAccount({
      registrantAccountId: near.predecessorAccountId(),
      accountId: accountId,
      amount: storageCost.toString(),
    });
    const refund = attachedDeposit - storageCost;
    if (refund > 0) {
      near.log(
        "Storage registration refunding " +
          refund +
          " yoctoNEAR to " +
          near.predecessorAccountId()
      );
      this.internalSendNEAR(near.predecessorAccountId(), refund);
    }
    return {
      message: `Account ${accountId} registered with storage deposit of ${storageCost.toString()}`,
    };
  }

  @call({ payableFunction: true })
  ft_transfer({
    receiver_id,
    amount,
    memo,
  }: {
    receiver_id: string;
    amount: string;
    memo: string;
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log(
      "Transfer " + amount + " token from " + senderId + " to " + receiver_id
    );
    this.internalTransfer(senderId, receiver_id, amount, memo);
  }

  @call({ payableFunction: true })
  ft_transfer_call({
    receiver_id,
    amount,
    memo,
    msg,
  }: {
    receiver_id: string;
    amount: string;
    memo: string;
    msg: string;
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    this.internalTransfer(senderId, receiver_id, amount, memo);
    const promise = near.promiseBatchCreate(receiver_id);
    const params = {
      sender_id: senderId,
      amount: amount,
      msg: msg,
      receiver_id: receiver_id,
    };
    near.log(
      "Transfer call " +
        amount +
        " token from " +
        senderId +
        " to " +
        receiver_id +
        " with message " +
        msg
    );
    near.promiseBatchActionFunctionCall(
      promise,
      "ft_on_transfer",
      encode(JSON.stringify(params)),
      0,
      30000000000000
    );
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
    assert(
      near.attachedDeposit() > BigInt(0),
      "Requires at least 1 yoctoNEAR to ensure signature"
    );
  }

  static isLeftGreaterThanRight(
    left: string | bigint | number | boolean,
    right: string | bigint | number | boolean,
    message: string = null
  ) {
    const msg =
      message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }
}
