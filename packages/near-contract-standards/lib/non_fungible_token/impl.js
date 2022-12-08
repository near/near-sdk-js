import { UnorderedMap, LookupMap, near, UnorderedSet, assert, NearPromise, bytes, serialize, str, concat, } from "near-sdk-js";
import { TokenMetadata } from "./metadata";
import { refund_storage_deposit, refund_deposit, refund_deposit_to_account, assert_at_least_one_yocto, assert_one_yocto, } from "./utils";
import { NftMint, NftTransfer } from "./events";
import { Token } from "./token";
const GAS_FOR_RESOLVE_TRANSFER = 15000000000000n;
const GAS_FOR_NFT_TRANSFER_CALL = 30000000000000n + GAS_FOR_RESOLVE_TRANSFER;
const GAS_FOR_NFT_APPROVE = 20000000000000n;
function repeat(str, n) {
    return Array(n + 1).join(str);
}
function expect_token_found(option) {
    if (option === null) {
        throw new Error("Token not found");
    }
    return option;
}
function expect_approval(option) {
    if (option === null) {
        throw new Error("next_approval_by_id must be set for approval ext");
    }
    return option;
}
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
export class NonFungibleToken {
    constructor() {
        this.owner_id = "";
        this.extra_storage_in_bytes_per_token = 0n;
        this.owner_by_id = new UnorderedMap("");
        this.token_metadata_by_id = null;
        this.tokens_per_owner = null;
        this.approvals_by_id = null;
        this.next_approval_id_by_id = null;
    }
    nft_total_supply() {
        return this.owner_by_id.length;
    }
    enum_get_token(owner_id, token_id) {
        const metadata = this.token_metadata_by_id.get(token_id, {
            reconstructor: TokenMetadata.reconstruct,
        });
        const approved_account_ids = this.approvals_by_id.get(token_id, {
            defaultValue: {},
        });
        return new Token(token_id, owner_id, metadata, approved_account_ids);
    }
    nft_tokens({ from_index, limit, }) {
        const start_index = from_index === undefined ? 0 : from_index;
        assert(this.owner_by_id.length >= start_index, "Out of bounds, please use a smaller from_index.");
        let l = limit === undefined ? 2 ** 32 : limit;
        assert(l > 0, "limit must be greater than 0.");
        l = Math.min(l, this.owner_by_id.length - start_index);
        const ret = [];
        for (let i = start_index; i < start_index + l; i++) {
            const token_id = this.owner_by_id.keys.get(i);
            const owner_id = this.owner_by_id.get(token_id);
            ret.push(this.enum_get_token(owner_id, token_id));
        }
        return ret;
    }
    nft_supply_for_owner({ account_id }) {
        const tokens_per_owner = this.tokens_per_owner;
        assert(tokens_per_owner !== null, "Could not find tokens_per_owner when calling a method on the enumeration standard.");
        const account_tokens = tokens_per_owner.get(account_id, {
            reconstructor: UnorderedSet.reconstruct,
        });
        return account_tokens === null ? 0 : account_tokens.length;
    }
    nft_tokens_for_owner({ account_id, from_index, limit, }) {
        const tokens_per_owner = this.tokens_per_owner;
        assert(tokens_per_owner !== undefined, "Could not find tokens_per_owner when calling a method on the enumeration standard.");
        const token_set = tokens_per_owner.get(account_id, {
            reconstructor: UnorderedSet.reconstruct,
        });
        assert(token_set !== null, "Token set is empty");
        const start_index = from_index === undefined ? 0 : from_index;
        assert(token_set.length >= start_index, "Out of bounds, please use a smaller from_index.");
        let l = limit === undefined ? 2 ** 32 : limit;
        assert(l > 0, "limit must be greater than 0.");
        l = Math.min(l, token_set.length - start_index);
        const ret = [];
        for (let i = start_index; i < start_index + l; i++) {
            const token_id = token_set.elements.get(i);
            const owner_id = this.owner_by_id.get(token_id);
            ret.push(this.enum_get_token(owner_id, token_id));
        }
        return ret;
    }
    nft_approve({ token_id, account_id, msg, }) {
        assert_at_least_one_yocto();
        if (this.approvals_by_id === null) {
            throw new Error("NFT does not support Approval Management");
        }
        const approvals_by_id = this.approvals_by_id;
        const owner_id = expect_token_found(this.owner_by_id.get(token_id));
        assert(near.predecessorAccountId() === owner_id, "Predecessor must be token owner.");
        const next_approval_id_by_id = expect_approval(this.next_approval_id_by_id);
        const approved_account_ids = approvals_by_id.get(token_id) ?? {};
        const approval_id = next_approval_id_by_id.get(token_id) ?? 1n;
        const old_approved_account_ids_size = serialize(approved_account_ids).length;
        approved_account_ids[account_id] = approval_id;
        const new_approved_account_ids_size = serialize(approved_account_ids).length;
        approvals_by_id.set(token_id, approved_account_ids);
        next_approval_id_by_id.set(token_id, approval_id + 1n);
        const storage_used = new_approved_account_ids_size - old_approved_account_ids_size;
        refund_deposit(BigInt(storage_used));
        if (msg) {
            return NearPromise.new(account_id).functionCall("nft_on_approve", serialize({ token_id, owner_id, approval_id, msg }), 0n, near.prepaidGas() - GAS_FOR_NFT_APPROVE);
        }
        return null;
    }
    nft_revoke({ token_id, account_id, }) {
        assert_one_yocto();
        if (this.approvals_by_id === null) {
            throw new Error("NFT does not support Approval Management");
        }
        const approvals_by_id = this.approvals_by_id;
        const owner_id = expect_token_found(this.owner_by_id.get(token_id));
        const predecessorAccountId = near.predecessorAccountId();
        assert(predecessorAccountId === owner_id, "Predecessor must be token owner.");
        const approved_account_ids = approvals_by_id.get(token_id);
        const old_approved_account_ids_size = serialize(approved_account_ids).length;
        let new_approved_account_ids_size;
        if (approved_account_ids[account_id]) {
            delete approved_account_ids[account_id];
            if (Object.keys(approved_account_ids).length === 0) {
                approvals_by_id.remove(token_id);
                new_approved_account_ids_size = serialize(approved_account_ids).length;
            }
            else {
                approvals_by_id.set(token_id, approved_account_ids);
                new_approved_account_ids_size = 0;
            }
            refund_storage_deposit(predecessorAccountId, new_approved_account_ids_size - old_approved_account_ids_size);
        }
    }
    nft_revoke_all({ token_id }) {
        assert_one_yocto();
        if (this.approvals_by_id === null) {
            throw new Error("NFT does not support Approval Management");
        }
        const approvals_by_id = this.approvals_by_id;
        const owner_id = expect_token_found(this.owner_by_id.get(token_id));
        const predecessorAccountId = near.predecessorAccountId();
        assert(predecessorAccountId === owner_id, "Predecessor must be token owner.");
        const approved_account_ids = approvals_by_id.get(token_id);
        if (approved_account_ids) {
            refund_storage_deposit(predecessorAccountId, serialize(approved_account_ids).length);
            approvals_by_id.remove(token_id);
        }
    }
    nft_is_approved({ token_id, approved_account_id, approval_id, }) {
        expect_token_found(this.owner_by_id.get(token_id));
        if (this.approvals_by_id === null) {
            return false;
        }
        const approvals_by_id = this.approvals_by_id;
        const approved_account_ids = approvals_by_id.get(token_id);
        if (approved_account_ids === null) {
            return false;
        }
        const actual_approval_id = approved_account_ids[approved_account_id];
        if (actual_approval_id === undefined) {
            return false;
        }
        if (approval_id) {
            return BigInt(approval_id) === actual_approval_id;
        }
        return true;
    }
    init(owner_by_id_prefix, owner_id, token_metadata_prefix, enumeration_prefix, approval_prefix) {
        let approvals_by_id;
        let next_approval_id_by_id;
        if (approval_prefix) {
            const prefix = approval_prefix.into_storage_key();
            approvals_by_id = new LookupMap(str(prefix));
            next_approval_id_by_id = new LookupMap(str(prefix) + "n");
        }
        else {
            approvals_by_id = null;
            next_approval_id_by_id = null;
        }
        this.owner_id = owner_id;
        this.extra_storage_in_bytes_per_token = 0n;
        this.owner_by_id = new UnorderedMap(str(owner_by_id_prefix.into_storage_key()));
        this.token_metadata_by_id = token_metadata_prefix
            ? new LookupMap(str(token_metadata_prefix.into_storage_key()))
            : null;
        this.tokens_per_owner = enumeration_prefix
            ? new LookupMap(str(enumeration_prefix.into_storage_key()))
            : null;
        this.approvals_by_id = approvals_by_id;
        this.next_approval_id_by_id = next_approval_id_by_id;
        this.measure_min_token_storage_cost();
    }
    static reconstruct(data) {
        const ret = new NonFungibleToken();
        Object.assign(ret, data);
        ret.owner_by_id = UnorderedMap.reconstruct(ret.owner_by_id);
        if (ret.token_metadata_by_id) {
            ret.token_metadata_by_id = LookupMap.reconstruct(ret.token_metadata_by_id);
        }
        if (ret.tokens_per_owner) {
            ret.tokens_per_owner = LookupMap.reconstruct(ret.tokens_per_owner);
        }
        if (ret.approvals_by_id) {
            ret.approvals_by_id = LookupMap.reconstruct(ret.approvals_by_id);
        }
        if (ret.next_approval_id_by_id) {
            ret.next_approval_id_by_id = LookupMap.reconstruct(ret.next_approval_id_by_id);
        }
        return ret;
    }
    measure_min_token_storage_cost() {
        const initial_storage_usage = near.storageUsage();
        // 64 Length because this is the max account id length
        const tmp_token_id = repeat("a", 64);
        const tmp_owner_id = repeat("a", 64);
        // 1. set some dummy data
        this.owner_by_id.set(tmp_token_id, tmp_owner_id);
        if (this.token_metadata_by_id) {
            this.token_metadata_by_id.set(tmp_token_id, new TokenMetadata(repeat("a", 64), repeat("a", 64), repeat("a", 64), repeat("a", 64), 1n, null, null, null, null, null, null, null));
        }
        if (this.tokens_per_owner) {
            const u = new UnorderedSet(str(new TokensPerOwner(near.sha256(bytes(tmp_owner_id))).into_storage_key()));
            u.set(tmp_token_id);
            this.tokens_per_owner.set(tmp_owner_id, u);
        }
        if (this.approvals_by_id) {
            const approvals = {};
            approvals[tmp_owner_id] = 1n;
            this.approvals_by_id.set(tmp_token_id, approvals);
        }
        if (this.next_approval_id_by_id) {
            this.next_approval_id_by_id.set(tmp_token_id, 1n);
        }
        // 2. see how much space it took
        this.extra_storage_in_bytes_per_token =
            near.storageUsage() - initial_storage_usage;
        // 3. roll it all back
        if (this.next_approval_id_by_id) {
            this.next_approval_id_by_id.remove(tmp_token_id);
        }
        if (this.approvals_by_id) {
            this.approvals_by_id.remove(tmp_token_id);
        }
        if (this.tokens_per_owner) {
            const u = this.tokens_per_owner.remove(tmp_owner_id, {
                reconstructor: UnorderedSet.reconstruct,
            });
            u.remove(tmp_token_id);
        }
        if (this.token_metadata_by_id) {
            this.token_metadata_by_id.remove(tmp_token_id);
        }
        this.owner_by_id.remove(tmp_token_id);
    }
    internal_transfer_unguarded(token_id, from, to) {
        this.owner_by_id.set(token_id, to);
        if (this.tokens_per_owner) {
            const owner_tokens_set = this.tokens_per_owner.get(from, {
                reconstructor: UnorderedSet.reconstruct,
            });
            if (owner_tokens_set == null) {
                throw new Error("Unable to access tokens per owner in unguarded call.");
            }
            owner_tokens_set.remove(token_id);
            if (owner_tokens_set.isEmpty()) {
                this.tokens_per_owner.remove(from);
            }
            else {
                this.tokens_per_owner.set(from, owner_tokens_set);
            }
            let receiver_tokens_set = this.tokens_per_owner.get(to, {
                reconstructor: UnorderedSet.reconstruct,
            });
            if (receiver_tokens_set === null) {
                receiver_tokens_set = new UnorderedSet(str(new TokensPerOwner(near.sha256(bytes(to))).into_storage_key()));
            }
            receiver_tokens_set.set(token_id);
            this.tokens_per_owner.set(to, receiver_tokens_set);
        }
    }
    internal_transfer(sender_id, receiver_id, token_id, approval_id, memo) {
        const owner_id = this.owner_by_id.get(token_id);
        if (owner_id == null) {
            throw new Error("Token not found");
        }
        const approved_account_ids = this.approvals_by_id?.remove(token_id);
        let sender_id_authorized;
        if (sender_id != owner_id) {
            if (!approved_account_ids) {
                throw new Error("Unauthorized");
            }
            const actual_approval_id = approved_account_ids[sender_id];
            if (!actual_approval_id) {
                throw new Error("Sender not approved");
            }
            assert(approval_id === undefined || approval_id == actual_approval_id, `The actual approval_id ${actual_approval_id} is different from the given ${approval_id}`);
            sender_id_authorized = sender_id;
        }
        else {
            sender_id_authorized = undefined;
        }
        assert(owner_id != receiver_id, "Current and next owner must differ");
        this.internal_transfer_unguarded(token_id, owner_id, receiver_id);
        NonFungibleToken.emit_transfer(owner_id, receiver_id, token_id, sender_id_authorized, memo);
        return [owner_id, approved_account_ids];
    }
    static emit_transfer(owner_id, receiver_id, token_id, sender_id, memo) {
        new NftTransfer(owner_id, receiver_id, [token_id], sender_id && sender_id == owner_id ? sender_id : undefined, memo).emit();
    }
    internal_mint(token_id, token_owner_id, token_metadata) {
        const token = this.internal_mint_with_refund(token_id, token_owner_id, token_metadata, near.predecessorAccountId());
        new NftMint(token.owner_id, [token.token_id]).emit();
        return token;
    }
    internal_mint_with_refund(token_id, token_owner_id, token_metadata, refund_id) {
        let initial_storage_usage = null;
        if (refund_id) {
            initial_storage_usage = [refund_id, near.storageUsage()];
        }
        if (this.token_metadata_by_id && token_metadata === undefined) {
            throw new Error("Must provide metadata");
        }
        if (this.owner_by_id.get(token_id)) {
            throw new Error("token_id must be unique");
        }
        const owner_id = token_owner_id;
        this.owner_by_id.set(token_id, owner_id);
        this.token_metadata_by_id?.set(token_id, token_metadata);
        if (this.tokens_per_owner) {
            let token_ids = this.tokens_per_owner.get(owner_id, {
                reconstructor: UnorderedSet.reconstruct,
            });
            if (token_ids === null) {
                token_ids = new UnorderedSet(str(new TokensPerOwner(near.sha256(bytes(owner_id))).into_storage_key()));
            }
            token_ids.set(token_id);
            this.tokens_per_owner.set(owner_id, token_ids);
        }
        const approved_account_ids = this.approvals_by_id ? {} : undefined;
        if (initial_storage_usage) {
            const [id, storage_usage] = initial_storage_usage;
            refund_deposit_to_account(near.storageUsage() - storage_usage, id);
        }
        return new Token(token_id, owner_id, token_metadata, approved_account_ids);
    }
    nft_transfer({ receiver_id, token_id, approval_id, memo, }) {
        assert_at_least_one_yocto();
        const sender_id = near.predecessorAccountId();
        this.internal_transfer(sender_id, receiver_id, token_id, approval_id, memo);
    }
    nft_transfer_call({ receiver_id, token_id, approval_id, memo, msg, }) {
        assert_at_least_one_yocto();
        assert(near.prepaidGas() > GAS_FOR_NFT_TRANSFER_CALL, "Not enough prepaid gas");
        const sender_id = near.predecessorAccountId();
        const [previous_owner_id, approved_account_ids] = this.internal_transfer(sender_id, receiver_id, token_id, approval_id, memo);
        const promise = NearPromise.new(receiver_id)
            .functionCall("nft_on_transfer", bytes(JSON.stringify({ sender_id, previous_owner_id, token_id, msg })), 0n, near.prepaidGas() - GAS_FOR_NFT_TRANSFER_CALL)
            .then(NearPromise.new(near.currentAccountId()).functionCall("nft_resolve_transfer", bytes(JSON.stringify({
            previous_owner_id,
            receiver_id,
            token_id,
            approved_account_ids,
        })), 0n, GAS_FOR_RESOLVE_TRANSFER));
        return promise;
    }
    nft_token({ token_id }) {
        const owner_id = this.owner_by_id.get(token_id);
        if (owner_id == null) {
            return null;
        }
        const metadata = this.token_metadata_by_id?.get(token_id, {
            reconstructor: TokenMetadata.reconstruct,
        });
        const approved_account_ids = this.approvals_by_id?.get(token_id);
        return new Token(token_id, owner_id, metadata, approved_account_ids);
    }
    nft_resolve_transfer({ previous_owner_id, receiver_id, token_id, approved_account_ids, }) {
        let must_revert = false;
        let p;
        try {
            p = str(near.promiseResult(0));
        }
        catch (e) {
            if (e.message.includes("Not Ready")) {
                throw new Error();
            }
            else {
                must_revert = true;
            }
        }
        if (!must_revert) {
            try {
                const yes_or_no = JSON.parse(p);
                if (typeof yes_or_no == "boolean") {
                    must_revert = yes_or_no;
                }
                else {
                    must_revert = true;
                }
            }
            catch (_e) {
                must_revert = true;
            }
        }
        if (!must_revert) {
            return true;
        }
        const current_owner = this.owner_by_id.get(token_id);
        if (current_owner) {
            if (current_owner != receiver_id) {
                return true;
            }
        }
        else {
            if (approved_account_ids) {
                refund_storage_deposit(previous_owner_id, serialize(approved_account_ids).length);
            }
            return true;
        }
        this.internal_transfer_unguarded(token_id, receiver_id, previous_owner_id);
        if (this.approvals_by_id) {
            const receiver_approvals = this.approvals_by_id.get(token_id);
            if (receiver_approvals) {
                refund_storage_deposit(receiver_id, serialize(receiver_approvals).length);
            }
            if (approved_account_ids) {
                this.approvals_by_id.set(token_id, approved_account_ids);
            }
        }
        NonFungibleToken.emit_transfer(receiver_id, previous_owner_id, token_id, null, null);
        return false;
    }
}
export class TokensPerOwner {
    constructor(account_hash) {
        this.account_hash = account_hash;
    }
    into_storage_key() {
        return concat(bytes("\x00"), this.account_hash);
    }
}
export class TokenPerOwnerInner {
    constructor(account_id_hash) {
        this.account_id_hash = account_id_hash;
    }
    into_storage_key() {
        return concat(bytes("\x01"), this.account_id_hash);
    }
}
