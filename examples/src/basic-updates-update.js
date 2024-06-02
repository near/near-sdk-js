import {NearBindgen, call, view, near, migrate, Vector, assert, UnorderedMap, LookupSet, ONE_NEAR} from "near-sdk-js";

const POINT_ONE = ONE_NEAR / 10000n;

class OldPostedMessage {
    constructor() {
        this.premium = false;
        this.sender = "";
        this.text = "";
    }
}

export class OldState {
    constructor() {
        this.messages = new Vector("a");
        this.payments = new Vector("b");
    }
}

class PostedMessage {
    constructor() {
        this.payment = 0n;
        this.premium = false;
        this.sender = "";
        this.text = "";
    }

    static new(payment, premium, sender, text) {
        let posted_message = new PostedMessage();
        posted_message.payment = payment;
        posted_message.premium = premium;
        posted_message.sender = sender;
        posted_message.text = text;
        return posted_message;
    }
}

@NearBindgen({})
export class GuestBook {
    constructor() {
        this.messages = new Vector("a");
    }

    @migrate({})
    migrateState() {
        assert(this.messages !== undefined, "Contract state should not be deserialized in @migrate");
        // retrieve the current state from the contract
        let old_state = JSON.parse(near.storageRead("STATE"));

        let new_messages = new Vector("p");

        old_state.messages.toArray().forEach((posted, idx) => {
            let payment = old_state
                .payments
                .get(idx) || "0N";
            new_messages.push(PostedMessage.new(payment, posted.premium, posted.sender, posted.text));
        });

        old_state.messages.clear();
        old_state.payments.clear();

        this.messages = new_messages;
    }
}