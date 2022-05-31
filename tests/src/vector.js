import {
    NearContract,
    NearBindgen,
    call,
    view,
    Vector
} from 'near-sdk-js'

@NearBindgen
class VectorTestContract extends NearContract {
    constructor() {
        super()
        this.vector = new Vector('a');
    }

    deserialize() {
        super.deserialize();
        this.vector = Object.assign(new Vector, this.vector);
    }

    @view
    len() {
        return this.vector.len();
    }

    @view
    isEmpty() {
        return this.vector.isEmpty();
    }

    @view
    get(index) {
        return this.vector.get(index);
    }

    @call
    push(value) {
        this.vector.push(value);
    }

    @call
    pop() {
        this.vector.pop();
    }

    @call
    clear() {
        this.vector.clear();
    }

    @view
    toArray() {
        return this.vector.toArray();
    }

    @call
    extend(kvs) {
        this.vector.extend(kvs);
    }

    @call
    replace(index, value) {
        this.vector.replace(index, value);
    }

    @call
    swapRemove(index) {
        this.vector.swapRemove(index);
    }
}

