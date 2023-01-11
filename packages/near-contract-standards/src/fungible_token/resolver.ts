import { AccountId, Balance } from "near-sdk-js";

export interface FungibleTokenResolver {
    ft_resolve_transfer(
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: number,
    ) : Balance;
}
