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
import { AccountId } from "near-sdk-js/lib/types";
import { NearEvent } from "../event";
import { TokenId } from "./token";
import { Option } from "./utils";

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

/** Data to log for an NFT mint event. To log this event, call `.emit()` */
export class NftMint {
  constructor(
    public owner_id: AccountId,
    public token_ids: TokenId[],
    public memo: Option<string>
  ) {}

  /** Logs the event to the host. This is required to ensure that the event is triggered
   * and to consume the event. */
  emit() {
    NftMint.emit_many([this]);
  }

  /** Emits an nft mint event, through `near.log`,
   * where each [`NftMint`] represents the data of each mint. */
  static emit_many(data: NftMint[]) {
    new_171_v1(data).emit();
  }
}

/** Data to log for an NFT transfer event. To log this event,
 * call [`.emit()`](NftTransfer.emit). */
export class NftTransfer {
  constructor(
    public old_owner_id: AccountId,
    public new_owner_id: AccountId,
    public token_ids: TokenId[],
    public authorized_id: Option<AccountId>,
    public memo: Option<string>
  ) {}

  /** Logs the event to the host. This is required to ensure that the event is triggered
   * and to consume the event. */
  emit() {
    NftTransfer.emit_many([this]);
  }

  /** Emits an nft transfer event, through `near.log`,
   * where each [`NftTransfer`] represents the data of each transfer. */
  static emit_many(data: NftTransfer[]) {
    new_171_v1(data).emit();
  }
}

/** Data to log for an NFT burn event. To log this event, call [`.emit()`](NftBurn.emit). */
export class NftBurn {
  constructor(
    public owner_id: AccountId,
    public token_ids: TokenId[],
    authorized_id: Option<string>,
    public memo: Option<string>
  ) {}

  /** Logs the event to the host. This is required to ensure that the event is triggered
   * and to consume the event. */
  emit() {
    NftBurn.emit_many([this]);
  }

  /** Emits an nft burn event, through `near.log`,
   * where each [`NftBurn`] represents the data of each burn. */
  static emit_many(data: NftBurn[]) {
    new_171_v1(data).emit();
  }
}

function new_171(version: string, event_kind: Nep171EventKind): NearEvent {
  return new Nep171Event(version, event_kind);
}

function new_171_v1(event_kind: Nep171EventKind): NearEvent {
  return new_171("1.0.0", event_kind);
}
