import {NearContract, NearBindgen, call, view, near} from '../../../sdk'

@NearBindgen
class OnCall extends NearContract {
    constructor() {
        super()
        this.personOnCall = "undefined"
    }
    
    @call
    set_person_on_call(accountId) {
        env.log(`Trying to set ${accountId} on-call`)
        const status = near.jsvmCall('status-message.test.near', 'get_status', [accountId])
        env.log(`${accountId} status is ${status}`)
        if (status === 'AVAILABLE') {
            this.personOnCall = accountId
            env.log(`${accountId} set on-call`)
        } else {
            env.log(`${accountId} can not be set on-call`)
        }
    }

    @view
    person_on_call() {
        env.log(`Returning person on-call: ${this.personOnCall}`)
        return this.personOnCall
    }
}
