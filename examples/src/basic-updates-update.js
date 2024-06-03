import {NearBindgen, call, view, near, migrate, Vector, assert, UnorderedMap, LookupSet, ONE_NEAR} from "near-sdk-js";
import {MigrationDemo} from "../build/state-migration-new.js";
import {Contract} from "../build/nested-collections.js";

const POINT_ONE = ONE_NEAR / 10000n;

class OldPostedMessage {
    constructor() {
        this.premium = false;
        this.sender = "";
        this.text = "";
    }
}

@NearBindgen({})
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
        const _state = OldState._getState();
        const _contract = OldState._create();
        if (_state) {
            OldState._reconstruct(_contract, _state);
        }

        let new_messages = new Vector("p");

        _contract.messages.toArray().forEach((posted, idx) => {
            let payment = _contract
                .payments
                .get(idx) || 0n;
            new_messages.push(PostedMessage.new(payment, posted.premium, posted.sender, posted.text));
        });

        _contract.messages.clear();
        _contract.payments.clear();

        this.messages = new_messages;
    }

    @call({payableFunction: true})
    add_message({text}) {
        const payment = near.attachedDeposit();
        let premium = payment > POINT_ONE;
        const sender = near.predecessorAccountId();
        let message = PostedMessage.new(payment, premium, sender, text);
        this.messages.push(message);
    }

    @view({})
    get_message({ index }) {
        return this.messages.get(index) || null;
    }
}