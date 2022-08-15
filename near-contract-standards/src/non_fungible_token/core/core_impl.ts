import { UnorderedMap, LookupMap, Bytes, near, UnorderedSet, assert } from "near-sdk-js";
import { IntoStorageKey } from "near-sdk-js/lib/utils"
import { TokenMetadata } from "../metadata"
import { hash_account_id } from "../utils"
import { NftTransfer } from "../events"

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

    internal_transfer_unguarded(token_id: string, from: string, to: string) {
        this.owner_by_id.set(token_id, to)

        if (this.tokens_per_owner) {
            let owner_tokens = this.tokens_per_owner.get(from)
            if (owner_tokens == null) {
                throw new Error("Unable to access tokens per owner in unguarded call.")
            }
            let owner_tokens_set = UnorderedSet.deserialize(owner_tokens as UnorderedSet);
            if (owner_tokens_set.isEmpty()) {
                this.tokens_per_owner.remove(from)
            } else {
                this.tokens_per_owner.set(from, owner_tokens_set)
            }

            let receiver_tokens = this.tokens_per_owner.get(to)
            if (receiver_tokens == null) {
                receiver_tokens = new UnorderedSet(new TokensPerOwner(near.sha256(to)).into_storage_key());
            } else {
                receiver_tokens = UnorderedSet.deserialize(receiver_tokens as UnorderedSet);
            }
            (receiver_tokens as UnorderedSet).set(token_id);
            this.tokens_per_owner.set(to, receiver_tokens)
        }
    }
    
    internal_transfer(sender_id: string, receiver_id: string, token_id: string, approval_id: bigint | null, memo: string | null): [string, Map<string, bigint> | null] {
        let owner_id = this.owner_by_id.get(token_id);
        if (owner_id == null) {
            throw new Error("Token not found");
        }

        let approved_account_ids = this.approvals_by_id?.remove(token_id);

        let sender_id_authorized: string | null;
        if (sender_id != owner_id) {
            if (!approved_account_ids) {
                throw new Error("Unauthorized");
            }

            let actual_approval_id = (approved_account_ids as any)[sender_id]
            if (!actual_approval_id) {
                throw new Error("Sender not approved")
            }

            assert(approval_id == null || approval_id == actual_approval_id,
                `The actual approval_id ${actual_approval_id} is different from the given ${approval_id}`);
            sender_id_authorized = sender_id
        } else {
            sender_id_authorized = null    
        }
        assert(owner_id != receiver_id, "Current and next owner must differ")
        this.internal_transfer_unguarded(token_id, owner_id as string, receiver_id)
        NonFungibleToken.emit_transfer(owner_id as string, receiver_id, token_id, sender_id_authorized, memo)
        return [owner_id as string, approved_account_ids == null ? null : approved_account_ids as Map<string, bigint>]
    }

    static emit_transfer(owner_id: string, receiver_id: string, token_id: string, sender_id: string | null, memo: string | null) {
        new NftTransfer(owner_id, receiver_id, [token_id], (sender_id && (sender_id == owner_id)) ? sender_id : null, memo).emit()
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

