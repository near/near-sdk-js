import {
    NearContract,
    NearBindgen,
    call,
    view,
    LookupMap
} from 'near-sdk-js'

@NearBindgen
class LookupMapTestContract extends NearContract {
    constructor() {
        super()
        this.lookupMap = new LookupMap('a');
    }

    deserialize() {
        super.deserialize();
        this.lookupMap = Object.assign(new LookupMap, this.lookupMap);
    }

    @view
    get({key}) {
        return this.lookupMap.get(key);
    }

    @view
    containsKey({key}) {
        return this.lookupMap.containsKey(key);
    }

    @call
    set({key, value}) {
        this.lookupMap.set(key, value);
    }

    @call
    remove({key}) {
        this.lookupMap.remove(key);
    }

    @call
    extend({kvs}) {
        this.lookupMap.extend(kvs);
    }
}
