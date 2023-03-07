import { NearBindgen, view, near, migrate, call, Vector, assert } from 'near-sdk-js'
import { AccountId } from 'near-sdk-js/lib/types'

type Message = {
    sender: AccountId,
    header: string,
    text: string,
}

@NearBindgen({})
export class MigrationDemo {
    messages: Vector<Message>;

    constructor() {
        this.messages = new Vector<Message>('messages');
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
}