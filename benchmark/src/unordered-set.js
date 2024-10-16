import { NearBindgen, call, UnorderedSet, view } from "near-sdk-js";

@NearBindgen({})
export class UnorderedSetContract {
    constructor() {
        this.unorderedSet = new UnorderedSet("US");
    }

    @call({})
    addElement({ value }) {
        this.unorderedSet.set(value);
    }

    @call({})
    removeElement({ value }) {
        this.unorderedSet.remove(value);
    }

    @view({})
    containsElement({ value }) {
        return this.unorderedSet.contains(value);
    }

    @view({})
    iterate() {
        const size = this.unorderedSet.length;
        for (let i = 0; i < size; i++) {
            this.unorderedSet.contains(i);
        }
    }
}
