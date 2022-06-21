import {
    NearContract,
    NearBindgen,
    call,
    view,
    UnorderedSet,
    Vector
} from 'near-sdk-js'

@NearBindgen
class UnorderedSetTestContract extends NearContract {
    constructor() {
        super()
        this.unorderedSet = new UnorderedSet('a');
    }

    deserialize() {
        super.deserialize()
        this.unorderedSet.elements = Object.assign(new Vector, this.unorderedSet.elements)
        this.unorderedSet = Object.assign(new UnorderedSet, this.unorderedSet)
    }

    @view
    len() {
        return this.unorderedSet.len();
    }

    @view
    isEmpty() {
        return this.unorderedSet.isEmpty();
    }

    @view
    contains({element}) {
        return this.unorderedSet.contains(element);
    }

    @call
    set({element}) {
        this.unorderedSet.set(element);
    }

    @call
    remove({element}) {
        this.unorderedSet.remove(element);
    }

    @call
    clear() {
        this.unorderedSet.clear();
    }

    @view
    toArray() {
        return this.unorderedSet.toArray();
    }

    @call
    extend({elements}) {
        this.unorderedSet.extend(elements);
    }
}

