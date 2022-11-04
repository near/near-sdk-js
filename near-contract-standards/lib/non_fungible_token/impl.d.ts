import { UnorderedMap, LookupMap, Bytes, UnorderedSet, NearPromise } from "near-sdk-js/lib";
import { TokenMetadata } from "./metadata";
import { IntoStorageKey, Option } from "./utils";
import { NonFungibleTokenResolver } from "./core/resolver";
import { AccountId } from "near-sdk-js/lib/types/index";
import { Token } from "./token";
import { NonFungibleTokenCore } from "./core";
import { NonFungibleTokenApproval } from "./approval";
import { NonFungibleTokenEnumeration } from "./enumeration";
/** Implementation of the non-fungible token standard.
 * Allows to include NEP-171 compatible token to any contract.
 * There are next traits that any contract may implement:
 *     - NonFungibleTokenCore -- interface with nft_transfer methods. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenApproval -- interface with nft_approve methods. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenEnumeration -- interface for getting lists of tokens. NonFungibleToken provides methods for it.
 *     - NonFungibleTokenMetadata -- return metadata for the token in NEP-177, up to contract to implement.
 *
 * For example usage, see near-contract-standards/example-contracts/non-fungible-token/my-nft.ts.
 */
export declare class NonFungibleToken implements NonFungibleTokenCore, NonFungibleTokenResolver, NonFungibleTokenApproval, NonFungibleTokenEnumeration {
    owner_id: string;
    extra_storage_in_bytes_per_token: bigint;
    owner_by_id: UnorderedMap<AccountId>;
    token_metadata_by_id: Option<LookupMap<TokenMetadata>>;
    tokens_per_owner: Option<LookupMap<UnorderedSet<string>>>;
    approvals_by_id: Option<LookupMap<{
        [approvals: string]: bigint;
    }>>;
    next_approval_id_by_id: Option<LookupMap<bigint>>;
    constructor();
    nft_total_supply(): number;
    private enum_get_token;
    nft_tokens([from_index, limit]: [
        from_index: number | null,
        limit: number | null
    ]): Token[];
    nft_supply_for_owner(account_id: string): number;
    nft_tokens_for_owner([account_id, from_index, limit]: [
        account_id: string,
        from_index: number,
        limit: number
    ]): Token[];
    nft_approve([token_id, account_id, msg]: [
        token_id: string,
        account_id: string,
        msg: string
    ]): Option<NearPromise>;
    nft_revoke([token_id, account_id]: [token_id: string, account_id: string]): void;
    nft_revoke_all(token_id: string): void;
    nft_is_approved([token_id, approved_account_id, approval_id]: [
        token_id: string,
        approved_account_id: string,
        approval_id: bigint
    ]): boolean;
    init(owner_by_id_prefix: IntoStorageKey, owner_id: string, token_metadata_prefix: Option<IntoStorageKey>, enumeration_prefix: Option<IntoStorageKey>, approval_prefix: Option<IntoStorageKey>): void;
    static reconstruct(data: NonFungibleToken): NonFungibleToken;
    measure_min_token_storage_cost(): void;
    internal_transfer_unguarded(token_id: string, from: string, to: string): void;
    internal_transfer(sender_id: string, receiver_id: string, token_id: string, approval_id: Option<bigint>, memo: Option<string>): [string, {
        [approvals: string]: bigint;
    } | null];
    static emit_transfer(owner_id: string, receiver_id: string, token_id: string, sender_id: Option<string>, memo: Option<string>): void;
    internal_mint(token_id: string, token_owner_id: string, token_metadata: Option<TokenMetadata>): Token;
    internal_mint_with_refund(token_id: string, token_owner_id: string, token_metadata: Option<TokenMetadata>, refund_id: Option<string>): Token;
    nft_transfer([receiver_id, token_id, approval_id, memo]: [
        receiver_id: string,
        token_id: string,
        approval_id: Option<bigint>,
        memo: Option<string>
    ]): void;
    nft_transfer_call([receiver_id, token_id, approval_id, memo, msg]: [
        receiver_id: string,
        token_id: string,
        approval_id: Option<bigint>,
        memo: Option<string>,
        msg: string
    ]): NearPromise;
    nft_token(token_id: string): Option<Token>;
    nft_resolve_transfer([previous_owner_id, receiver_id, token_id, approved_account_ids,]: [
        previous_owner_id: string,
        receiver_id: string,
        token_id: string,
        approved_account_ids: Option<{
            [approvals: string]: bigint;
        }>
    ]): boolean;
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
