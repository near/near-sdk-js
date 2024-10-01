import { NearBindgen, call, LookupMap, view } from "near-sdk-js";

@NearBindgen({})
export class LookupMapContract {
    constructor() {
        this.lookupMap = new LookupMap("LM");
    }

    @call({})
    addElement({ key, value }) {
        this.lookupMap.set(key, value);
    }

    @call({})
    removeElement({ key }) {
        this.lookupMap.remove(key);
    }

    @view({})
    getElement({ key }) {
        return this.lookupMap.get(key);
    }
}
