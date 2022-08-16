import {NearEvent} from '../event'

export type Nep171EventKind = NftMint[] | NftTransfer[] | NftBurn[];

export class Nep171Event extends NearEvent {
    version: string;
    event_kind: Nep171EventKind;

    constructor(version: string, event_kind: Nep171EventKind) {
        super();
        this.version = version;
        this.event_kind = event_kind;
    }
}

export class NftMint {
    constructor(public owner_id: string, public token_ids: string[], public memo: Option<string>) {}

    emit() {
        NftMint.emit_many([this]);
    }

    static emit_many(data: NftMint[]) {
        new_171_v1(data).emit()
    }
}

export class NftTransfer {
    constructor(public old_owner_id: string, public new_owner_id: string, public token_ids: string[], public authorized_id: Option<string>, public memo: Option<string>) {}

    emit() {
        NftTransfer.emit_many([this]);
    }

    static emit_many(data: NftTransfer[]) {
        new_171_v1(data).emit()
    }
}

export class NftBurn {
    constructor(public owner_id: string, public token_ids: string[], authorized_id: Option<string>, public memo: Option<string>) {}
    
    emit() {
        NftBurn.emit_many([this]);
    }

    static emit_many(data: NftBurn[]) {
        new_171_v1(data).emit()
    }
}

function new_171(version: string, event_kind: Nep171EventKind): NearEvent {
    return new Nep171Event(version, event_kind);
}

function new_171_v1(event_kind: Nep171EventKind): NearEvent {
    return new_171("1.0.0", event_kind);
}