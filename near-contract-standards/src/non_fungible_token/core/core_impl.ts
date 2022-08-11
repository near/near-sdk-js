import { UnorderedMap, LookupMap, Bytes, near, UnorderedSet } from "near-sdk-js";
import { IntoStorageKey } from "near-sdk-js/lib/utils"
import { TokenMetadata } from "../metadata"
import { hash_account_id } from "../utils"

const GAS_FOR_RESOLVE_TRANSFER = 5_000_000_000_000n;
const GAS_FOR_NFT_TRANSFER_CALL = 25_000_000_000_000n + GAS_FOR_RESOLVE_TRANSFER;

function repeat(str: string, n: number) {
    return Array(n + 1).join(str);
}

export class NonFungibleToken {
    public owner_id: string;
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
        let approvals_by_id: LookupMap | null;
        let next_approval_id_by_id: LookupMap | null;
        if (approval_prefix) {
            let prefix = approval_prefix.into_storage_key();
            approvals_by_id = new LookupMap(prefix);
            next_approval_id_by_id = new LookupMap(prefix);
        } else {
            approvals_by_id = null;
            next_approval_id_by_id = null;
        }

        this.owner_id = owner_id;
        this.extra_storage_in_bytes_per_token = 0n;
        this.owner_by_id = new UnorderedMap(owner_by_id_prefix.into_storage_key());
        this.token_metadata_by_id = token_metadata_prefix ? new LookupMap(token_metadata_prefix.into_storage_key()) : null;
        this.approvals_by_id = approvals_by_id;
        this.next_approval_id_by_id = next_approval_id_by_id;
    }

    init() {
        this.measure_min_token_storage_cost();
    }

    measure_min_token_storage_cost() {
        let initial_storage_usage = near.storageUsage();
        // 64 Length because this is the max account id length
        let tmp_token_id = repeat("a", 64);
        let tmp_owner_id = repeat("a", 64);

        // 1. set some dummy data
        this.owner_by_id.set(tmp_token_id, tmp_owner_id);
        if(this.token_metadata_by_id) {
            this.token_metadata_by_id.set(
                tmp_token_id,
                new TokenMetadata(
                    repeat("a", 64),
                    repeat("a", 64),
                    repeat("a", 64),
                    repeat("a", 64),
                    1n,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                )
            )
        }
        if(this.tokens_per_owner) {
            let u = new UnorderedSet(new TokensPerOwner(near.sha256(tmp_owner_id)).into_storage_key());
            u.set(tmp_token_id);
            this.tokens_per_owner.set(tmp_owner_id, u);
        }
        if(this.approvals_by_id) {
            let approvals = {}
            approvals[tmp_owner_id] = 1n;
            this.approvals_by_id.set(tmp_token_id, approvals);
        }
        if(this.next_approval_id_by_id) {
            this.next_approval_id_by_id.set(tmp_token_id, 1n);
        }
        let u = new UnorderedSet(new TokenPerOwnerInner(hash_account_id(tmp_owner_id)).into_storage_key())
        if(this.tokens_per_owner) {
            this.tokens_per_owner.set(tmp_owner_id, u);
        }

        // 2. see how much space it took
        this.extra_storage_in_bytes_per_token = near.storageUsage() - initial_storage_usage;

        // 3. roll it all back
        if (this.next_approval_id_by_id) {
            this.next_approval_id_by_id.remove(tmp_token_id);
        }
        if (this.approvals_by_id) {
            this.approvals_by_id.remove(tmp_token_id);
        }
        if (this.tokens_per_owner) {
            this.tokens_per_owner.remove(tmp_owner_id);
        }
        if (this.token_metadata_by_id) {
            this.token_metadata_by_id.remove(tmp_token_id);
        }
        if (this.tokens_per_owner) {
            this.tokens_per_owner.remove(tmp_owner_id);
        }
    }
}

export type StorageKey = TokensPerOwner | TokenPerOwnerInner;

export class TokensPerOwner {
    constructor(
        public account_hash: Bytes
    ) {}

    into_storage_key(): Bytes {
        return '\x00' + this.account_hash;
    }
}

export class TokenPerOwnerInner {
    constructor(
        public account_id_hash: Bytes
    ) {}

    into_storage_key(): Bytes {
        return '\x01' + this.account_id_hash;
    }
}

