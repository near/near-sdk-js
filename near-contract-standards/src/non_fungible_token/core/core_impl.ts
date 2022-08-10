import { UnorderedMap, LookupMap, Bytes } from "near-sdk-js";
import { IntoStorageKey } from "near-sdk-js/lib/utils"
const GAS_FOR_RESOLVE_TRANSFER = 5_000_000_000_000n;
const GAS_FOR_NFT_TRANSFER_CALL = 25_000_000_000_000n + GAS_FOR_RESOLVE_TRANSFER;

export class NonFungibleToken {
    public owner: string;
    public extra_storage_in_bytes_per_token: bigint;
    public owner_by_id: UnorderedMap;
    public token_metadata_by_id: LookupMap | null;
    public tokens_per_owner: LookupMap | null;
    public approvals_by_id: LookupMap | null;
    public next_approval_id_by_id: LookupMap | null;

    constructor(
        owner_by_id_prefix: IntoStorageKey,
        owner_id: string,
        token_metadata_prefix: IntoStorageKey | null,
        enumeration_prefix: IntoStorageKey | null,
        approval_prefix: IntoStorageKey | null,
    ) {
        
    }
}

export type StorageKey = TokensPerOwner | TokenPerOwnerInner;

export class TokensPerOwner {
    constructor(
        public account_hash: Bytes
    ) {}
}

export class TokenPerOwnerInner {
    constructor(
        public account_id_hash: Bytes
    ) {}
}

