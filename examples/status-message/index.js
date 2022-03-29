import {NearContract, NearBindgen, call, view} from '../../sdk'

@NearBindgen
class StatusMessage extends NearContract {
    constructor() {
        super()
        this.records = {}
    }

    @call
    set_status(message) {
        env.signer_account_id(0)
        let account_id = env.read_register(0)
        env.log(`${account_id} set_status with message ${message}`)
        this.records[account_id] = message
    }

    @view
    get_status(account_id) {
        env.log(`get_status for account_id ${account_id}`)
        return this.records[account_id]
    }
}

