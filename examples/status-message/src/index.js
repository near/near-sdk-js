import {NearContract, NearBindgen, call, view, near} from 'near-sdk-js'

@NearBindgen
class StatusMessage extends NearContract {
    constructor() {
        super()
        this.records = {}
    }

    @call
    set_status(message) {
        let account_id = near.signerAccountId()
        env.log(`${account_id} set_status with message ${message}`)
        this.records[account_id] = message
    }

    @view
    get_status(account_id) {
        env.log(`get_status for account_id ${account_id}`)
        return this.records[account_id] || null
    }
}

