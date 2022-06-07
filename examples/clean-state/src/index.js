import { NearContract, NearBindgen, call, view, near, LookupMap } from 'near-sdk-js'

@NearBindgen
class CleanState extends NearContract {
    @call
    clean({keys}) {
        keys.forEach(key => near.jsvmStorageRemove(key))
    }

    @call
    put({key, value}) {
        near.jsvmStorageWrite(key, value)
    }

    @view
    get({key}) {
        return near.jsvmStorageRead(key)
    }

    @view
    ifExistReturn6({key}) {
        const res = near.jsvmStorageRead(key)
        if (res) {
            return 6
        } else {
            return 7
        }
    }
}
