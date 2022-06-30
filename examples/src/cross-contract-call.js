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
        const promise = near.promiseBatchCreate('statusmessage.test.near')
        near.promiseBatchActionFunctionCall(promise, 'get_status', bytes(JSON.stringify({ account_id: accountId })), 0, 30000000000000)
        near.promiseThen(promise, near.currentAccountId(), '_set_person_on_call_private', bytes(JSON.stringify({ accountId: accountId })), 0, 30000000000000);
    }

    @call
    _set_person_on_call_private({ accountId }) {
        near.log(`_set_person_on_call_private called, accountId ${accountId}`)
        if (near.currentAccountId() !== near.predecessorAccountId()) {
            near.panic('Function can be used as a callback only')
        }
        const status = JSON.parse(near.promiseResult(0))
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
