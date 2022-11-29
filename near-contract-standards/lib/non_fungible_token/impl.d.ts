import { AccountId, UnorderedMap, LookupMap, Bytes, UnorderedSet, NearPromise } from "near-sdk-js";
import { TokenMetadata } from "./metadata";
import { IntoStorageKey, Option } from "./utils";
import { NonFungibleTokenResolver } from "./core/resolver";
import { Token, TokenId } from "./token";
import { NonFungibleTokenCore } from "./core";
import { NonFungibleTokenApproval } from "./approval";
import { NonFungibleTokenEnumeration } from "./enumeration";
/** Implementation of the non-fungible token standard.
 * Allows to include NEP-171 compatible token to any contract.
 * There are next interfaces that any contract may implement:
 *     - NonFungibleTokenCore -- interface with nft_transfer methods. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenApproval -- interface with nft_approve methods. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenEnumeration -- interface for getting lists of tokens. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenMetadata -- return metadata for the token in NEP-177, up to contract to implement.
 *
 * For example usage, see near-contract-standards/example-contracts/non-fungible-token/my-nft.ts.
 */
export declare class NonFungibleToken implements NonFungibleTokenCore, NonFungibleTokenResolver, NonFungibleTokenApproval, NonFungibleTokenEnumeration {
    owner_id: AccountId;
    extra_storage_in_bytes_per_token: bigint;
    owner_by_id: UnorderedMap<AccountId>;
    token_metadata_by_id: Option<LookupMap<TokenMetadata>>;
    tokens_per_owner: Option<LookupMap<UnorderedSet<TokenId>>>;
    approvals_by_id: Option<LookupMap<{
        [approvals: AccountId]: bigint;
    }>>;
    next_approval_id_by_id: Option<LookupMap<bigint>>;
    constructor();
    nft_total_supply(): number;
    private enum_get_token;
    nft_tokens({ from_index, limit, }: {
        from_index?: number;
        limit?: number;
    }): Token[];
    nft_supply_for_owner({ account_id }: {
        account_id: AccountId;
    }): number;
    nft_tokens_for_owner({ account_id, from_index, limit, }: {
        account_id: AccountId;
        from_index?: number;
        limit?: number;
    }): Token[];
    nft_approve({ token_id, account_id, msg, }: {
        token_id: TokenId;
        account_id: AccountId;
        msg: string;
    }): Option<NearPromise>;
    nft_revoke({ token_id, account_id, }: {
        token_id: TokenId;
        account_id: AccountId;
    }): void;
    nft_revoke_all({ token_id }: {
        token_id: TokenId;
    }): void;
    nft_is_approved({ token_id, approved_account_id, approval_id, }: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: bigint;
    }): boolean;
    init(owner_by_id_prefix: IntoStorageKey, owner_id: AccountId, token_metadata_prefix?: IntoStorageKey, enumeration_prefix?: IntoStorageKey, approval_prefix?: IntoStorageKey): void;
    static reconstruct(data: NonFungibleToken): NonFungibleToken;
    measure_min_token_storage_cost(): void;
    internal_transfer_unguarded(token_id: TokenId, from: AccountId, to: AccountId): void;
    internal_transfer(sender_id: AccountId, receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string): [AccountId, Option<{
        [approvals: AccountId]: bigint;
    }>];
    static emit_transfer(owner_id: AccountId, receiver_id: AccountId, token_id: TokenId, sender_id?: AccountId, memo?: string): void;
    internal_mint(token_id: TokenId, token_owner_id: AccountId, token_metadata?: TokenMetadata): Token;
    internal_mint_with_refund(token_id: TokenId, token_owner_id: AccountId, token_metadata?: TokenMetadata, refund_id?: string): Token;
    nft_transfer({ receiver_id, token_id, approval_id, memo, }: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
    }): void;
    nft_transfer_call({ receiver_id, token_id, approval_id, memo, msg, }: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
        msg: string;
    }): NearPromise;
    nft_token({ token_id }: {
        token_id: TokenId;
    }): Option<Token>;
    nft_resolve_transfer({ previous_owner_id, receiver_id, token_id, approved_account_ids, }: {
        previous_owner_id: AccountId;
        receiver_id: AccountId;
        token_id: TokenId;
        approved_account_ids?: {
            [approvals: AccountId]: bigint;
        };
    }): boolean;
}
export declare type StorageKey = TokensPerOwner | TokenPerOwnerInner;
export declare class TokensPerOwner implements IntoStorageKey {
    account_hash: Bytes;
    constructor(account_hash: Bytes);
    into_storage_key(): Bytes;
}
export declare class TokenPerOwnerInner implements IntoStorageKey {
    account_id_hash: Bytes;
    constructor(account_id_hash: Bytes);
    into_storage_key(): Bytes;
}
