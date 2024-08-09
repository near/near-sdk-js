import {NearBindgen, call, view, near} from "near-sdk-js";

@NearBindgen({
    serializer(_value) {
        throw new Error('serialize err')
    },
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
