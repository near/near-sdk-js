import { NearContract, NearBindgen, call, view, near } from 'near-sdk-js'

@NearBindgen
class OnCall extends NearContract {
    constructor({ }) {
        super()
        this.personOnCall = "undefined"
    }

    @call
    set_person_on_call({ accountId }) {
        near.log(`Trying to set ${accountId} on-call`)
        const status = near.jsvmCall('status-message.test.near', 'get_status', { account_id: accountId })
        near.log(`${accountId} status is ${status}`)
        if (status === 'AVAILABLE') {
            this.personOnCall = accountId
            near.log(`${accountId} set on-call`)
        } else {
            near.log(`${accountId} can not be set on-call`)
        }
    }

    @view
    person_on_call() {
        near.log(`Returning person on-call: ${this.personOnCall}`)
        return this.personOnCall
    }
}
