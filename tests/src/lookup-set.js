import {
    NearContract,
    NearBindgen,
    call,
    view,
    LookupSet
} from 'near-sdk-js'

@NearBindgen
class LookupSetTestContract extends NearContract {
    constructor() {
        super()
        this.lookupSet = new LookupSet('a');
    }

    deserialize() {
        super.deserialize();
        this.lookupSet = Object.assign(new LookupSet, this.lookupSet);
    }

    @view
    contains(key) {
        return this.lookupSet.contains(key);
    }

    @call
    set(key) {
        this.lookupSet.set(key);
    }

    @call
    remove(key) {
        this.lookupSet.remove(key);
    }

    @call
    extend(keys) {
        this.lookupSet.extend(keys);
    }
}

