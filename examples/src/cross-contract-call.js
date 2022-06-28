import { NearContract, NearBindgen, call, view, near, bytes } from 'near-sdk-js'

@NearBindgen
class OnCall extends NearContract {
    constructor({ }) {
        super()
        this.personOnCall = "undefined"
    }

    @call
    set_person_on_call({ accountId }) {
        near.log(`Trying to set ${accountId} on-call`)
        // const status = near.jsvmCall('status-message.test.near', 'get_status', { account_id: accountId })
        // TODO: rewrite api.js to named parameters
        const promise = near.promiseBatchCreate('status-message.test.near')
        near.promiseBatchActionFunctionCall(promise, 'get_status', bytes(JSON.stringify({ account_id: accountId })), 0, 30000000000000)
        const resBytes = near.promiseResult(promise)
        near.log(`resBytes: ${resBytes}`)
        const status = 'AVAILABLE' // TODO: get from res
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
