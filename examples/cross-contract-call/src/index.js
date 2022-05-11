import {NearContract, NearBindgen, call, view, near} from '../../../sdk'


@NearBindgen
class OnCall extends NearContract {
    constructor() {
        super()
        this.personOnCall = "undefined"
    }
    
    @call
    set_person_on_call(accountId) {
        const available = near.jsvmCall('status-message.test.near', 'get_status', accountId) === 'AVAILABLE'
        if (available) {
            this.personOnCall = accountId
            env.log(`${accountId} set on-call`)
        } else {
            env.log(`${accountId} is not available`)
        }
    }

    @view
    person_on_call() {
        return this.personOnCall
    }
}
