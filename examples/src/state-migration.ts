// @ts-nocheck
import { NearBindgen, view, near, migrate, call, Vector, assert } from 'near-sdk-js'
import { AccountId } from 'near-sdk-js/lib/types'

type Message = {
    sender: AccountId,
    header: string,
    message: string,
}

@NearBindgen({})
export class MigrationDemo {
    messages: Vector

    constructor() {
        this.messages = new Vector('messages'); // TODO: change
    }

    @call({ payableFunction: true })
    addMessage({ message }: {
        message: Message
    }): void {
        this.messages.push(message);
        near.log(`${near.signerAccountId()} added message ${JSON.stringify(message)}`);
    }

    @view({})
    countMessages(): number {
        return this.messages.toArray().length;
    }


    @migrate({})
    migrateState(): string {
        assert(this.messages.toArray().length == 0, "Contract state should not be deserialized in @migrate");
        // retrieve the current state from the contract
        let raw_vector = JSON.parse(near.storageRead("STATE")).messages;
        let old_messages: Vector<Message> = new Vector<Message>(raw_vector.prefix, raw_vector.length);
        near.log("old_messages: " + JSON.stringify(old_messages));

        // iterate through the state migrating it to the new version
        let new_messages: Vector<Message> = new Vector('messages');

        for (let message of old_messages) {
            if (message.length < 10) {
                near.log(`adding ${message} to new_messages`);
                new_messages.push(message);
            } else {
                near.log(`${message} is too long, skipping`);
            }
        }

        this.messages = new_messages;

        return this.messages;
    }
}