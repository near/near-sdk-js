import {
    NearContract,
    NearBindgen,
    call,
    view,
} from 'near-sdk-js'

@NearBindgen
class SimpleContractEmpty extends NearContract {
    status: string = 'default value'

    constructor({ }) {
        super()
    }

    @view
    getStatus({ }) {
        return this.status
    }

    @call
    setStatus({ status }: { status: string }) {
        this.status = status
    }
}
