import {
    NearContract,
    NearBindgen,
    call,
    view,
} from 'near-sdk-js'

@NearBindgen
class SimpleContractNoDefaults extends NearContract {
    status: string
    constructor({ status }: { status: string }) {
        super()
        this.status = status
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
