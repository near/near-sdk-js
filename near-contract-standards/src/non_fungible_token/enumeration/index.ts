import { AccountId } from "../../../../lib/types";
import { Token } from "../token";

export interface NonFungibleTokenEnumeration {
    nft_total_supply(): number;
    nft_tokens([from_index, limit]: [from_index: number | null, limit: number | null]): Token[];
    nft_supply_for_owner(account_id: AccountId): number;
    nft_tokens_for_owner([account_id, from_index, limit]: [account_id: AccountId, from_index: number, limit: number]): Token[];
}