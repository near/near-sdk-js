import {NearContract, NearBindgen, call, view, near} from '../../../sdk'


@NearBindgen
class OnCall extends NearContract {
    constructor() {
        super()
        this.personOnCall = "undefined"
    }
    
    @call
    set_person_on_call(accountId) {
        env.log(`Account ID in set_person_on_call: ${account_id}`)
        const available = near.jsvmCall('status-message.test.near', 'get_status', {'account_id': accountId}) === 'AVAILABLE'
        if (available) {
            this.personOnCall = accountId
            env.log(`${account_id} set on-call`)
        } else {
            env.log(`${account_id} is not available`)
        }
    }

    @view
    person_on_call() {
        return this.personOnCall
    }
}
