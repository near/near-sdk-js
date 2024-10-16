import { NearBindgen, view, near, migrate, call, Vector, assert } from 'near-sdk-js'
import { AccountId } from 'near-sdk-js/lib/types'

type OldMessageFormat = {
    sender: AccountId,
    header: string,
    text: string,
}

// This is the new version of the Message type, it has an additional field
type NewMessageFormat = {
    sender: AccountId,
    recipient?: AccountId,
    header: string,
    text: string,
}

@NearBindgen({})
export class MigrationDemo {
    messages: Vector<NewMessageFormat>;

    constructor() {
        this.messages = new Vector<NewMessageFormat>('messages');
    }

    @call({ payableFunction: true })
    addMessage({ message }: {
        message: NewMessageFormat
    }): void {
        this.messages.push(message);
        near.log(`${near.signerAccountId()} added message ${JSON.stringify(message)}`);
    }

    @view({})
    countMessages(): number {
        return this.messages.toArray().length;
    }


    @migrate({})
    migrateState(): Vector<NewMessageFormat> {
        assert(this.messages.toArray().length == 0, "Contract state should not be deserialized in @migrate");
        // retrieve the current state from the contract
        let raw_vector = JSON.parse(near.storageRead("STATE")).messages;
        let old_messages: Vector<OldMessageFormat> = new Vector<OldMessageFormat>(raw_vector.prefix, raw_vector.length);
        near.log("old_messages: " + JSON.stringify(old_messages));

        // iterate through the state migrating it to the new version
        let new_messages: Vector<NewMessageFormat> = new Vector('messages');

        for (let old_message of old_messages) {
            near.log(`migrating ${JSON.stringify(old_message)}`);
            const new_message: NewMessageFormat = {
                sender: old_message.sender,
                recipient: "Unknown",
                header: old_message.header,
                text: old_message.text,
            };
            if (new_message.text.length < 10) {
                near.log(`adding ${new_message} to new_messages`);
                new_messages.push(new_message);
            } else {
                near.log(`${new_message} is too long, skipping`);
            }
        }

        this.messages = new_messages;

        return this.messages;
    }
}