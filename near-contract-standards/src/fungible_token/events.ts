//! Standard for nep141 (Fungible Token) events.
//!
//! These events will be picked up by the NEAR indexer.
//!
//! <https://github.com/near/NEPs/blob/master/specs/Standards/FungibleToken/Event.md>
//!
//! This is an extension of the events format (nep-297):
//! <https://github.com/near/NEPs/blob/master/specs/Standards/EventsFormat.md>
//!
//! The three events in this standard are [`FtMint`], [`FtTransfer`], and [`FtBurn`].
//!
//! These events can be logged by calling `.emit()` on them if a single event, or calling
//! [`FtMint::emit_many`], [`FtTransfer::emit_many`],
//! or [`FtBurn::emit_many`] respectively.

use crate::event::NearEvent;
use near_sdk::json_types::U128;
use near_sdk::AccountId;
use serde::Serialize;

/// Data to log for an FT mint event. To log this event, call [`.emit()`](FtMint::emit).
class FtMint<'a> {
    owner_id: &'a AccountId,
    amount: &'a U128,
    #[serde(skip_serializing_if = "Option::is_none")]
    memo: Option<&'a str>,

    /// Logs the event to the host. This is required to ensure that the event is triggered
    /// and to consume the event.
    emit(self) {
        Self::emit_many(&[self])
    }

    /// Emits an FT mint event, through [`env::log_str`](near_sdk::env::log_str),
    /// where each [`FtMint`] represents the data of each mint.
    emit_many(data: &[FtMint<'_>]) {
        new_141_v1(Nep141EventKind::FtMint(data)).emit()
    }
}

/// Data to log for an FT transfer event. To log this event,
/// call [`.emit()`](FtTransfer::emit).
class FtTransfer<'a> {
    old_owner_id: &'a AccountId,
    new_owner_id: &'a AccountId,
    amount: &'a U128,
    #[serde(skip_serializing_if = "Option::is_none")]
    memo: Option<&'a str>,

    /// Logs the event to the host. This is required to ensure that the event is triggered
    /// and to consume the event.
    emit(self) {
        Self::emit_many(&[self])
    }

    /// Emits an FT transfer event, through [`env::log_str`](near_sdk::env::log_str),
    /// where each [`FtTransfer`] represents the data of each transfer.
    emit_many(data: &[FtTransfer<'_>]) {
        new_141_v1(Nep141EventKind::FtTransfer(data)).emit()
    }
}

/// Data to log for an FT burn event. To log this event, call [`.emit()`](FtBurn::emit).
class FtBurn<'a> {
    owner_id: &'a AccountId,
    amount: &'a U128,
    #[serde(skip_serializing_if = "Option::is_none")]
    memo: Option<&'a str>,

     /// Logs the event to the host. This is required to ensure that the event is triggered
    /// and to consume the event.
    emit(self) {
        Self::emit_many(&[self])
    }

    /// Emits an FT burn event, through [`env::log_str`](near_sdk::env::log_str),
    /// where each [`FtBurn`] represents the data of each burn.
    emit_many<'a>(data: &'a [FtBurn<'a>]) {
        new_141_v1(Nep141EventKind::FtBurn(data)).emit()
    }
}

#[derive(Serialize, Debug)]
pub(crate) struct Nep141Event<'a> {
    version: &'static str,
    #[serde(flatten)]
    event_kind: Nep141EventKind<'a>,
}

#[derive(Serialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[allow(clippy::enum_variant_names)]
enum Nep141EventKind<'a> {
    FtMint(&'a [FtMint<'a>]),
    FtTransfer(&'a [FtTransfer<'a>]),
    FtBurn(&'a [FtBurn<'a>]),
}

new_141<'a>(version: &'static str, event_kind: Nep141EventKind<'a>) : NearEvent<'a> {
    NearEvent::Nep141(Nep141Event { version, event_kind })
}

new_141_v1(event_kind: Nep141EventKind) : NearEvent {
    new_141("1.0.0", event_kind)
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use near_sdk::{test_utils, AccountId};

//     bob() -> AccountId {
//         AccountId::new_unchecked("bob".to_string())
//     }

//     alice() -> AccountId {
//         AccountId::new_unchecked("alice".to_string())
//     }

//     #[test]
//     ft_mint() {
//         let owner_id = &bob();
//         let amount = &U128(100);
//         FtMint { owner_id, amount, memo: None }.emit();
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_mint","data":[{"owner_id":"bob","amount":"100"}]}"#
//         );
//     }

//     #[test]
//     ft_mints() {
//         let owner_id = &bob();
//         let amount = &U128(100);
//         let mint_log = FtMint { owner_id, amount, memo: None };
//         FtMint::emit_many(&[
//             mint_log,
//             FtMint { owner_id: &alice(), amount: &U128(200), memo: Some("has memo") },
//         ]);
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_mint","data":[{"owner_id":"bob","amount":"100"},{"owner_id":"alice","amount":"200","memo":"has memo"}]}"#
//         );
//     }

//     #[test]
//     ft_burn() {
//         let owner_id = &bob();
//         let amount = &U128(100);
//         FtBurn { owner_id, amount, memo: None }.emit();
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_burn","data":[{"owner_id":"bob","amount":"100"}]}"#
//         );
//     }

//     #[test]
//     ft_burns() {
//         let owner_id = &bob();
//         let amount = &U128(100);
//         FtBurn::emit_many(&[
//             FtBurn { owner_id: &alice(), amount: &U128(200), memo: Some("has memo") },
//             FtBurn { owner_id, amount, memo: None },
//         ]);
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_burn","data":[{"owner_id":"alice","amount":"200","memo":"has memo"},{"owner_id":"bob","amount":"100"}]}"#
//         );
//     }

//     #[test]
//     ft_transfer() {
//         let old_owner_id = &bob();
//         let new_owner_id = &alice();
//         let amount = &U128(100);
//         FtTransfer { old_owner_id, new_owner_id, amount, memo: None }.emit();
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_transfer","data":[{"old_owner_id":"bob","new_owner_id":"alice","amount":"100"}]}"#
//         );
//     }

//     #[test]
//     ft_transfers() {
//         let old_owner_id = &bob();
//         let new_owner_id = &alice();
//         let amount = &U128(100);
//         FtTransfer::emit_many(&[
//             FtTransfer {
//                 old_owner_id: &alice(),
//                 new_owner_id: &bob(),
//                 amount: &U128(200),
//                 memo: Some("has memo"),
//             },
//             FtTransfer { old_owner_id, new_owner_id, amount, memo: None },
//         ]);
//         assert_eq!(
//             test_utils::get_logs()[0],
//             r#"EVENT_JSON:{"standard":"nep141","version":"1.0.0","event":"ft_transfer","data":[{"old_owner_id":"alice","new_owner_id":"bob","amount":"200","memo":"has memo"},{"old_owner_id":"bob","new_owner_id":"alice","amount":"100"}]}"#
//         );
//     }
// }
