import {
    NearBindgen,
    call,
    view,
    UnorderedSet,
} from 'near-sdk-js'
import { House, Room } from './model.js';

@NearBindgen({})
class UnorderedSetTestContract {
    constructor() {
        this.unorderedSet = new UnorderedSet('a');
    }

    @view({})
    len() {
        return this.unorderedSet.length;
    }

    @view({})
    isEmpty() {
        return this.unorderedSet.isEmpty();
    }

    @view({})
    contains({ element }) {
        return this.unorderedSet.contains(element);
    }

    @call({})
    set({ element }) {
        this.unorderedSet.set(element);
    }

    @call({})
    remove_key({ element }) {
        this.unorderedSet.remove(element);
    }

    @call({})
    clear() {
        this.unorderedSet.clear();
    }

    @view({})
    toArray() {
        const res = this.unorderedSet.toArray();
        return res;
    }

    @call({})
    extend({ elements }) {
        this.unorderedSet.extend(elements);
    }

    @call({})
    add_house({ name, rooms }) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        this.unorderedSet.set(house)
    }

    @view({})
    house_exist({ name, rooms }) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        return this.unorderedSet.contains(house)
    }
}

