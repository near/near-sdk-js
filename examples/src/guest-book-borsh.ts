import { NearBindgen, near, call, view, Vector } from 'near-sdk-js';
import * as borsh from 'borsh';

@NearBindgen({
  serializer(value) {
    return borsh.serialize(schema, value);
  },
  deserializer(value) {
    return borsh.deserialize(schema, value);
  },
})
class GuestBook {
  messages: Vector<PostedMessage> = new Vector<PostedMessage>('v-uid');

  @call({ payableFunction: true })
  // Public - Adds a new message.
  add_message({ text }: { text: string }) {
    // If the user attaches more than 0.1N the message is premium
    const premium = near.attachedDeposit() >= BigInt(POINT_ONE);
    const sender = near.predecessorAccountId();

    const message: PostedMessage = { premium, sender, text };
    this.messages.push(message, {
      serializer: (value) => borsh.serialize(MessageSchema, value),
    });
  }

  @view({})
  // Returns an array of messages.
  get_messages({
    from_index = 0,
    limit = 10,
  }: {
    from_index: number;
    limit: number;
  }): PostedMessage[] {
    return this.messages
      .toArray({
        deserializer: (value) => borsh.deserialize(MessageSchema, value),
      })
      .slice(from_index, from_index + limit);
  }

  @view({})
  total_messages(): number {
    return this.messages.length;
  }
}

const schema: borsh.Schema = {
  struct: {
    // Vector's internal info
    messages: {
      struct: {
        prefix: 'string',
        length: 'u32',
      },
    },
  },
};

const POINT_ONE = '100000000000000000000000';

class PostedMessage {
  premium: boolean;
  sender: string;
  text: string;

  constructor({ premium, sender, text }: PostedMessage) {
    this.premium = premium;
    this.sender = sender;
    this.text = text;
  }
}

const MessageSchema: borsh.Schema = {
  struct: {
    premium: 'bool',
    sender: 'string',
    text: 'string',
  },
};
