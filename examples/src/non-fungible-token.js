import {
  NearBindgen,
  call,
  view,
  initialize,
  near,
  LookupMap,
  bytes,
  assert,
} from "near-sdk-js";

class Token {
  constructor(token_id, owner_id) {
    this.token_id = token_id;
    this.owner_id = owner_id;
  }
}

@NearBindgen({ requireInit: true })
export class NftContract {
  constructor() {
    this.owner_id = "";
    this.owner_by_id = new LookupMap("a");
  }

  @initialize({})
  init({ owner_id, owner_by_id_prefix }) {
    this.owner_id = owner_id;
    this.owner_by_id = new LookupMap(owner_by_id_prefix);
  }

  internalTransfer({
    sender_id,
    receiver_id,
    token_id,
    approval_id: _ai,
    memo: _m,
  }) {
    let owner_id = this.owner_by_id.get(token_id);

    assert(owner_id !== null, "Token not found");
    assert(sender_id === owner_id, "Sender must be the current owner");
    assert(owner_id !== receiver_id, "Current and next owner must differ");

    this.owner_by_id.set(token_id, receiver_id);

    return owner_id;
  }

  @call({})
  nftTransfer({ receiver_id, token_id, approval_id, memo }) {
    let sender_id = near.predecessorAccountId();
    this.internalTransfer({
      sender_id,
      receiver_id,
      token_id,
      approval_id,
      memo,
    });
  }

  @call({})
  nftTransferCall({ receiver_id, token_id, approval_id, memo, msg }) {
    near.log(
      `nftTransferCall called, receiver_id ${receiver_id}, token_id ${token_id}`
    );
    let sender_id = near.predecessorAccountId();
    let old_owner_id = this.internalTransfer({
      sender_id,
      receiver_id,
      token_id,
      approval_id,
      memo,
    });

    const promise = near.promiseBatchCreate(receiver_id);
    near.promiseBatchActionFunctionCall(
      promise,
      "nftOnTransfer",
      bytes(
        JSON.stringify({
          senderId: sender_id,
          previousOwnerId: old_owner_id,
          tokenId: token_id,
          msg: msg,
        })
      ),
      0,
      30000000000000
    );
    near.promiseThen(
      promise,
      near.currentAccountId(),
      "_nftResolveTransfer",
      bytes(JSON.stringify({ sender_id, receiver_id, token_id })),
      0,
      30000000000000
    );
  }

  @call({ privateFunction: true })
  _nftResolveTransfer({ sender_id, receiver_id, token_id }) {
    near.log(
      `_nftResolveTransfer called, receiver_id ${receiver_id}, token_id ${token_id}`
    );
    const isTokenTransfered = JSON.parse(near.promiseResult(0));
    near.log(
      `${token_id} ${
        isTokenTransfered ? "was transfered" : "was NOT transfered"
      }`
    );

    if (!isTokenTransfered) {
      near.log(`Returning ${token_id} to ${receiver_id}`);
      const currentOwner = this.owner_by_id.get(token_id);
      if (currentOwner === receiver_id) {
        this.internalTransfer({
          sender_id: receiver_id,
          receiver_id: sender_id,
          token_id: token_id,
          approval_id: null,
          memo: null,
        });
        near.log(`${token_id} returned to ${sender_id}`);
        return;
      }
      near.log(
        `Failed to return ${token_id}. It was burned or not owned by ${receiver_id} now.`
      );
    }
  }

  @call({})
  nftMint({ token_id, token_owner_id, token_metadata: _ }) {
    let sender_id = near.predecessorAccountId();
    assert(sender_id === this.owner_id, "Unauthorized");
    assert(this.owner_by_id.get(token_id) === null, "Token ID must be unique");

    this.owner_by_id.set(token_id, token_owner_id);

    return new Token(token_id, token_owner_id);
  }

  @view({})
  nftToken({ token_id }) {
    let owner_id = this.owner_by_id.get(token_id);
    if (owner_id === null) {
      return null;
    }

    return new Token(token_id, owner_id);
  }
}
