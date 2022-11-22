import { NonFungibleTokenReceiver } from "near-contract-standards/lib/non_fungible_token/core/receiver";
import {
  assert,
  call,
  initialize,
  near,
  NearBindgen,
  NearPromise,
  PromiseOrValue,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js";

const BASE_GAS = 10_000_000_000_000n;
const PROMISE_CALL = 10_000_000_000_000n;
const GAS_FOR_NFT_ON_TRANSFER = BASE_GAS + PROMISE_CALL;

interface ValueReturnInterface {
  ok_go(return_it: boolean): PromiseOrValue<boolean>;
}

@NearBindgen({ requireInit: true })
export class TokenReceiver
  implements NonFungibleTokenReceiver, ValueReturnInterface
{
  public non_fungible_token_account_id: AccountId;

  constructor() {
    this.non_fungible_token_account_id = "";
  }

  @initialize({})
  init({
    non_fungible_token_account_id,
  }: {
    non_fungible_token_account_id: AccountId;
  }) {
    this.non_fungible_token_account_id = non_fungible_token_account_id;
  }

  @call({})
  nft_on_transfer({
    sender_id,
    previous_owner_id,
    token_id,
    msg,
  }: {
    sender_id: string;
    previous_owner_id: string;
    token_id: string;
    msg: string;
  }): PromiseOrValue<boolean> {
    assert(
      near.predecessorAccountId() === this.non_fungible_token_account_id,
      "Only supports the one non-fungible token contract"
    );
    near.log(
      `in nft_on_transfer; sender_id=${sender_id}, previous_owner_id=${previous_owner_id}, token_id=${token_id}, msg=${msg}`
    );
    switch (msg) {
      case "return-it-now":
        return true;
      case "return-it-later": {
        const prepaid_gas = near.prepaidGas();
        const account_id = near.currentAccountId();
        return NearPromise.new(account_id).functionCall(
          "ok_go",
          JSON.stringify(true),
          0n,
          prepaid_gas - GAS_FOR_NFT_ON_TRANSFER
        );
      }
      case "keep-it-now":
        return false;
      case "keep-it-later": {
        const prepaid_gas = near.prepaidGas();
        const account_id = near.currentAccountId();
        return NearPromise.new(account_id).functionCall(
          "ok_go",
          JSON.stringify(false),
          0n,
          prepaid_gas - GAS_FOR_NFT_ON_TRANSFER
        );
      }
      default:
        throw new Error("unsupported msg");
    }
  }

  @call({})
  ok_go(return_it: boolean): PromiseOrValue<boolean> {
    near.log(`in ok_go, return_it=${return_it}`);
    return return_it;
  }
}
