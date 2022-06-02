import {NearContract, NearBindgen, call, view, near, LookupSet, UnorderedMap, Vector} from 'near-sdk-js'

@NearBindgen
class StatusMessage extends NearContract {
    constructor() {
        super()
        this.records = new UnorderedMap('a')
        this.uniqueValues = new LookupSet('b')
    }

    deserialize() {
        super.deserialize()
        this.records.keys = Object.assign(new Vector, this.records.keys)
        this.records.values = Object.assign(new Vector, this.records.values)
        this.records = Object.assign(new UnorderedMap, this.records)
        this.uniqueValues = Object.assign(new LookupSet, this.uniqueValues)
    }

    @call
    set_status(message) {
        let account_id = near.signerAccountId()
        near.log(`${account_id} set_status with message ${message}`)
        this.records.set(account_id, message)
        this.uniqueValues.set(message)
    }

    @view
    get_status(account_id) {
        near.log(`get_status for account_id ${account_id}`)
        return this.records.get(account_id)
    }

    @view
    has_status(message) {
        // used for test LookupMap
        return this.uniqueValues.contains(message)
    }

    @view
    get_all_statuses() {
        // used for test UnorderedMap
        return this.records.toArray()
    }
}

