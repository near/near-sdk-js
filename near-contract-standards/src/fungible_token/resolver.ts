use near_sdk::{json_types::U128, AccountId};

interface FungibleTokenResolver {
    ft_resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) : U128;
}
