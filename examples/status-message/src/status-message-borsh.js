import { NearContract, NearBindgen, call, view, near } from 'near-sdk-js'
import { serialize, deserialize } from 'borsh';

const schema = new Map();;

@NearBindgen
class StatusMessage extends NearContract {
    constructor() {
        super()
        this.records = {}
    }


    deserialize() {
        let state = near.jsvmStorageRead('STATE');
        if (state) {
            Object.assign(this, deserialize(schema, state));
        } else {
            throw new Error('Contract state is empty')
        }
    }

    serialize() {
        near.jsvmStorageWrite('STATE', serialize(schema, this));
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

