import {NearBindgen, call, view, near} from "near-sdk-js";

const schema = {
    struct: { records: {map: { key: 'string', value: 'string' }} }
};

function borshSerializeStatusMessage(statusMessage) {
    return borsh.serialize(schema, statusMessage);
}

function borshDeserializeStatusMessage(value) {
    return  borsh.deserialize(schema, value)
}

@NearBindgen({
    serializer(value) {
        return borshSerializeStatusMessage(value);
    },
    deserializer(value) {
        return borshDeserializeStatusMessage(value);
    }
})
export class StatusMessage {
    constructor() {
        this.records = new Map()
    }

    @call({})
    set_status({ message }) {
        let account_id = near.signerAccountId()
        env.log(`${account_id} set_status with message ${message}`)
        this.records.set(account_id, message)
    }

    @view({})
    get_status({ account_id }) {
        env.log(`get_status for account_id ${account_id}`)
        return this.records.get(account_id) || null
    }
}
