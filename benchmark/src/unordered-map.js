import { NearBindgen, call, UnorderedMap, view } from "near-sdk-js";

@NearBindgen({})
export class UnorderedMapContract {
    constructor() {
        this.unorderedMap = new UnorderedMap("UM");
    }

    @call({})
    addElement({ key, value }) {
        this.unorderedMap.set(key, value);
    }

    @call({})
    removeElement({ key }) {
        this.unorderedMap.remove(key);
    }

    @view({})
    getElement({ key }) {
        return this.unorderedMap.get(key);
    }

    @view({})
    iterate() {
        const size = this.unorderedMap.length;
        for (let i = 0; i < size; i++) {
            this.unorderedMap.get(i);
        }
    }
}
