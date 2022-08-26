import {
    NearContract,
    NearBindgen,
    call,
    view,
    near
} from 'near-sdk-js'

@NearBindgen
class SimpleContractWithSignerApiNoDefault extends NearContract {
    status: string
    owner: string

    constructor({ status }: { status: string }) {
        super()
        this.status = status
    }

    init() {
        this.owner = near.signerAccountId()
    }

    @view
    getOwner({ }) {
        return this.owner
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
