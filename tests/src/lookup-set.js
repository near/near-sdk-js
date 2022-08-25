import {
    NearContract,
    NearBindgen,
    call,
    view,
    LookupSet
} from 'near-sdk-js'
import { House, Room } from './model.js';

@NearBindgen
class LookupSetTestContract extends NearContract {
    constructor() {
        super()
        this.lookupSet = new LookupSet('a');
    }

    default() {
        return new LookupSetTestContract();
    }

    @view
    contains({ key }) {
        return this.lookupSet.contains(key);
    }

    @call
    set({ key }) {
        this.lookupSet.set(key);
    }

    @call
    remove_key({ key }) {
        this.lookupSet.remove(key);
    }

    @call
    extend({ keys }) {
        this.lookupSet.extend(keys);
    }

    @call
    add_house({ name, rooms }) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        this.lookupSet.set(house)
    }

    @view
    house_exist({ name, rooms }) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        return this.lookupSet.contains(house)
    }
}

