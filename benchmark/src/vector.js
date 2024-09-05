import { NearBindgen, call, Vector, view } from "near-sdk-js";

@NearBindgen({})
export class VectorContract {
    constructor() {
        this.vector = new Vector("V");
    }

    @call({})
    addElement({ value }) {
        this.vector.push(value);
    }

    @call({})
    removeElement({ index }) {
        this.vector.swapRemove(index);
    }

    @view({})
    getElement({ index }) {
        return this.vector.get(index);
    }

    @view({})
    iterate() {
        const size = this.vector.length;
        for (let i = 0; i < size; i++) {
            this.vector.get(i);
        }
    }
}
