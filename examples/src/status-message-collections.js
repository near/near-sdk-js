import { NearBindgen, call, view, near, LookupSet, UnorderedMap } from 'near-sdk-js'

@NearBindgen({})
class StatusMessage {
    constructor() {
        this.records = new UnorderedMap('a')
        this.uniqueValues = new LookupSet('b')
    }

    @call({})
    set_status({ message }) {
        let account_id = near.signerAccountId()
        near.log(`${account_id} set_status with message ${message}`)
        this.records.set(account_id, message)
        this.uniqueValues.set(message)
    }

    @view({})
    get_status({ account_id }) {
        near.log(`get_status for account_id ${account_id}`)
        return this.records.get(account_id)
    }

    @view({})
    has_status({ message }) {
        // used for test LookupMap
        return this.uniqueValues.contains(message)
    }

    @view({})
    get_all_statuses() {
        // used for test UnorderedMap
        return this.records.toArray()
    }
}

