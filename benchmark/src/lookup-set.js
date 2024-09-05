import { NearBindgen, call, LookupSet, view } from "near-sdk-js";

@NearBindgen({})
export class LookupSetContract {
    constructor() {
        this.lookupSet = new LookupSet("LS");
    }

    @call({})
    addElement({ value }) {
        this.lookupSet.set(value);
    }

    @call({})
    removeElement({ value }) {
        this.lookupSet.remove(value);
    }

    @view({})
    containsElement({ value }) {
        return this.lookupSet.contains(value);
    }
}
