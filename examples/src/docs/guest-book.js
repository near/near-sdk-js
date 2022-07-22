/*
 * Example smart contract written in JavaScript
 *
 */

import { NearContract, NearBindgen, near, call, view, Vector } from 'near-sdk-js'

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

// If the user attaches more than 0.01N the message is premium
const PREMIUM_PRICE = BigInt('10000000000000000000000');

/** 
 * Creating a new class PostedMessage to keep track of important information
 */
class PostedMessage {
    constructor(text) {
        this.premium = near.attachedDeposit() >= PREMIUM_PRICE;
        this.sender = near.predecessorAccountId();
        this.text = text;
    }
}

// Define the contract structure
@NearBindgen
class Contract extends NearContract {
    // Define the constructor, which sets the message equal to the default message.
    constructor() {
        super()
        this.messages = new Vector('m');
    }

    deserialize() {
        super.deserialize()
        this.messages = Object.assign(new Vector, this.messages)
    }

    @call
    // Adds a new message under the name of the sender's account id.
    add_message({ text }) {
        const message = new PostedMessage(text);
        near.log(message);
        this.messages.push(message);
    }
    
    @view
    // Returns an array of last N messages.
    get_messages() {
        const numMessages = Math.min(MESSAGE_LIMIT, this.messages.length);
        const startIndex = this.messages.length - numMessages;
        const result = [];
        for(let i = 0; i < numMessages; i++) {
            result[i] = this.messages.get(i + startIndex);
        }
        return result;
    }
}