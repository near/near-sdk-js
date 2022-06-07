import {
    NearContract,
    NearBindgen,
    call,
    view,
    UnorderedMap,
    Vector
} from 'near-sdk-js'

@NearBindgen
class UnorderedMapTestContract extends NearContract {
    constructor() {
        super()
        this.unorderedMap = new UnorderedMap('a');
    }

    deserialize() {
        super.deserialize()
        this.unorderedMap.keys = Object.assign(new Vector, this.unorderedMap.keys)
        this.unorderedMap.values = Object.assign(new Vector, this.unorderedMap.values)
        this.unorderedMap = Object.assign(new UnorderedMap, this.unorderedMap)
    }

    @view
    len() {
        return this.unorderedMap.len();
    }

    @view
    isEmpty() {
        return this.unorderedMap.isEmpty();
    }

    @view
    serializeIndex({index}) {
        return this.unorderedMap.serializeIndex(index);
    }

    @view
    deserializeIndex({rawIndex}) {
        return this.unorderedMap.deserializeIndex(rawIndex);
    }

    @view
    getIndexRaw({key}) {
        return this.unorderedMap.getIndexRaw(key);
    }

    @view
    get({key}) {
        return this.unorderedMap.get(key);
    }

    @call
    set({key, value}) {
        this.unorderedMap.set(key, value);
    }

    @call
    remove({key}) {
        this.unorderedMap.remove(key);
    }

    @call
    clear() {
        this.unorderedMap.clear();
    }

    @view
    toArray() {
        return this.unorderedMap.toArray();
    }

    @call
    extend({kvs}) {
        this.unorderedMap.extend(kvs);
    }
}

