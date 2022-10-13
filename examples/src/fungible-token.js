import {
  NearBindgen,
  call,
  view,
  initialize,
  near,
  LookupMap,
  assert,
} from "near-sdk-js";

@NearBindgen({ initRequired: true })
export class FungibleToken {
  constructor() {
    this.accounts = new LookupMap("a");
    this.totalSupply = 0n;
  }

  @initialize({})
  init({ prefix, totalSupply }) {
    this.accounts = new LookupMap(prefix);
    this.totalSupply = BigInt(totalSupply);
    this.accounts.set(near.signerAccountId(), this.totalSupply);
    // In a real world Fungible Token contract, storage management is required to denfense drain-storage attack
  }

  internalDeposit({ accountId, amount }) {
    let balance = this.accounts.get(accountId, { defaultValue: 0n });
    let newBalance = balance + BigInt(amount);
    this.accounts.set(accountId, newBalance);
    this.totalSupply += BigInt(amount);
  }

  internalWithdraw({ accountId, amount }) {
    let balance = this.accounts.get(accountId, { defaultValue: 0n });
    let newBalance = balance - BigInt(amount);
    assert(newBalance >= 0n, "The account doesn't have enough balance");
    this.accounts.set(accountId, newBalance);
    let newSupply = this.totalSupply - BigInt(amount);
    assert(newSupply >= 0n, "Total supply overflow");
    this.totalSupply = newSupply;
  }

  internalTransfer({ senderId, receiverId, amount, memo: _ }) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    let amountInt = BigInt(amount);
    assert(amountInt > 0n, "The amount should be a positive number");
    this.internalWithdraw({ accountId: senderId, amount });
    this.internalDeposit({ accountId: receiverId, amount });
  }

  @call({})
  ftTransfer({ receiverId, amount, memo }) {
    let senderId = near.predecessorAccountId();
    this.internalTransfer({ senderId, receiverId, amount, memo });
  }

  @call({})
  ftTransferCall({ receiverId, amount, memo, msg }) {
    let senderId = near.predecessorAccountId();
    this.internalTransfer({ senderId, receiverId, amount, memo });
    const promise = near.promiseBatchCreate(receiverId);
    const params = {
      senderId: senderId,
      amount: amount,
      msg: msg,
      receiverId: receiverId,
    };
    near.promiseBatchActionFunctionCall(
      promise,
      "ftOnTransfer",
      JSON.stringify(params),
      0,
      30000000000000
    );
    return near.promiseReturn();
  }

  @view({})
  ftTotalSupply() {
    return this.totalSupply;
  }

  @view({})
  ftBalanceOf({ accountId }) {
    return this.accounts.get(accountId, { defaultValue: 0n });
  }
}
