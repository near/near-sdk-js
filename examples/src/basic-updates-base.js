import {
    NearBindgen,
    call,
    view,
    near,
    migrate,
    Vector,
    assert,
    UnorderedMap,
    LookupSet,
    validateAccountId, ONE_NEAR
} from "near-sdk-js";

const POINT_ONE = ONE_NEAR / 10000n;

class PostedMessage {
    constructor() {
        this.premium = false;
        this.sender = "";
        this.text = "";
    }

    static new(premium, sender, text) {
        let posted_message = new PostedMessage();
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
        this.payments = new Vector("b");
    }

    @call({payableFunction: true})
    add_message({text}) {
        const payment = near.attachedDeposit();
        let premium = payment > POINT_ONE;
        const sender = near.predecessorAccountId();
        let message = PostedMessage.new(premium, sender, text);
        this.messages.push(message);
        this.payments.push(payment);
    }

    @view({})
    get_message({ index }) {
        return this.messages.get(index) || null;
    }

    @view({})
    get_payments({ index }) {
        return this.payments.get(index) || null;
    }
}