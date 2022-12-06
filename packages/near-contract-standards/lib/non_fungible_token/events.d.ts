/** Standard for nep171 (Non-Fungible Token) events.
 *
 * These events will be picked up by the NEAR indexer.
 *
 * <https://github.com/near/NEPs/blob/69f76c6c78c2ebf05d856347c9c98ae48ad84ebd/specs/Standards/NonFungibleToken/Event.md>
 *
 * This is an extension of the events format (nep-297):
 * <https://github.com/near/NEPs/blob/master/specs/Standards/EventsFormat.md>
 *
 * The three events in this standard are [`NftMint`], [`NftTransfer`], and [`NftBurn`].
 *
 * These events can be logged by calling `.emit()` on them if a single event, or calling
 * [`NftMint.emit_many`], [`NftTransfer.emit_many`],
 * or [`NftBurn.emit_many`] respectively.
 */
import { AccountId } from "near-sdk-js";
import { NearEvent } from "../event";
import { TokenId } from "./token";
export type Nep171EventKind = NftMint[] | NftTransfer[] | NftBurn[];
export declare class Nep171Event extends NearEvent {
    version: string;
    event_kind: Nep171EventKind;
    constructor(version: string, event_kind: Nep171EventKind);
}
/** Data to log for an NFT mint event. To log this event, call `.emit()` */
export declare class NftMint {
    owner_id: AccountId;
    token_ids: TokenId[];
    memo?: string;
    constructor(owner_id: AccountId, token_ids: TokenId[], memo?: string);
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit(): void;
    /** Emits an nft mint event, through `near.log`,
     * where each [`NftMint`] represents the data of each mint. */
    static emit_many(data: NftMint[]): void;
}
/** Data to log for an NFT transfer event. To log this event,
 * call [`.emit()`](NftTransfer.emit). */
export declare class NftTransfer {
    old_owner_id: AccountId;
    new_owner_id: AccountId;
    token_ids: TokenId[];
    authorized_id?: AccountId;
    memo?: string;
    constructor(old_owner_id: AccountId, new_owner_id: AccountId, token_ids: TokenId[], authorized_id?: AccountId, memo?: string);
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit(): void;
    /** Emits an nft transfer event, through `near.log`,
     * where each [`NftTransfer`] represents the data of each transfer. */
    static emit_many(data: NftTransfer[]): void;
}
/** Data to log for an NFT burn event. To log this event, call [`.emit()`](NftBurn.emit). */
export declare class NftBurn {
    owner_id: AccountId;
    token_ids: TokenId[];
    authorized_id?: string;
    memo?: string;
    constructor(owner_id: AccountId, token_ids: TokenId[], authorized_id?: string, memo?: string);
    /** Logs the event to the host. This is required to ensure that the event is triggered
     * and to consume the event. */
    emit(): void;
    /** Emits an nft burn event, through `near.log`,
     * where each [`NftBurn`] represents the data of each burn. */
    static emit_many(data: NftBurn[]): void;
}
