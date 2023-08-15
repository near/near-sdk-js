import {NearBindgen, call, view, near} from "near-sdk-js";
import * as borsh from 'borsh';

const schema = {
    struct: { records: {map: { key: 'string', value: 'string' }} }
};

@NearBindgen({
    serializer(statusMessage) {
        return borsh.serialize(schema, statusMessage);
    },
    deserializer(value) {
        return borsh.deserialize(schema, value);
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
