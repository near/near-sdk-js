import { NearEvent } from "../event";
import { toSnakeCase } from "../util";
export class Nep171Event extends NearEvent {
    constructor(version, event_kind) {
        super();
        this.standard = "nep171";
        this.version = version;
        this.event = toSnakeCase(event_kind[0].constructor.name);
        this.data = event_kind;
    }
}
/** Data to log for an NFT mint event. To log this event, call `.emit()` */
export class NftMint {
    constructor(owner_id, token_ids, memo) {
        this.owner_id = owner_id;
        this.token_ids = token_ids;
        this.memo = memo;
    }
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit() {
        NftMint.emit_many([this]);
    }
    /** Emits an nft mint event, through `near.log`,
     * where each [`NftMint`] represents the data of each mint. */
    static emit_many(data) {
        new_171_v1(data).emit();
    }
}
/** Data to log for an NFT transfer event. To log this event,
 * call [`.emit()`](NftTransfer.emit). */
export class NftTransfer {
    constructor(old_owner_id, new_owner_id, token_ids, authorized_id, memo) {
        this.old_owner_id = old_owner_id;
        this.new_owner_id = new_owner_id;
        this.token_ids = token_ids;
        this.authorized_id = authorized_id;
        this.memo = memo;
    }
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit() {
        NftTransfer.emit_many([this]);
    }
    /** Emits an nft transfer event, through `near.log`,
     * where each [`NftTransfer`] represents the data of each transfer. */
    static emit_many(data) {
        new_171_v1(data).emit();
    }
}
/** Data to log for an NFT burn event. To log this event, call [`.emit()`](NftBurn.emit). */
export class NftBurn {
    constructor(owner_id, token_ids, authorized_id, memo) {
        this.owner_id = owner_id;
        this.token_ids = token_ids;
        this.authorized_id = authorized_id;
        this.memo = memo;
    }
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit() {
        NftBurn.emit_many([this]);
    }
    /** Emits an nft burn event, through `near.log`,
     * where each [`NftBurn`] represents the data of each burn. */
    static emit_many(data) {
        new_171_v1(data).emit();
    }
}
/** Data to log for an NFT contract metadata updates. To log this event, call [`.emit()`](NftContractMetadataUpdate.emit). */
export class NftContractMetadataUpdate {
    constructor(memo) {
        this.memo = memo;
    }
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit() {
        NftContractMetadataUpdate.emit_many([this]);
    }
    /** Emits an contract metadata update event, through `near.log`,
     * where each [`NftBurn`] represents the data of each burn. */
    static emit_many(data) {
        new_171_v1(data).emit();
    }
}
function new_171(version, event_kind) {
    return new Nep171Event(version, event_kind);
}
function new_171_v1(event_kind) {
    return new_171("1.0.0", event_kind);
}
