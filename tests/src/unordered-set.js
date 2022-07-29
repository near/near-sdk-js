import {
    NearContract,
    NearBindgen,
    call,
    view,
    UnorderedSet,
    Vector
} from 'near-sdk-js'
import { Serializer } from 'superserial';
import {House, Room} from './model.js';

@NearBindgen
class UnorderedSetTestContract extends NearContract {
    constructor() {
        super()
        this.unorderedSet = new UnorderedSet('a', {House, Room});
    }

    deserialize() {
        super.deserialize()
        this.unorderedSet.elements.serializer = new Serializer({classes: {House, Room}})
        this.unorderedSet.elements = Object.assign(new Vector, this.unorderedSet.elements)
        this.unorderedSet.serializer = new Serializer({classes: {House, Room}})
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
    remove_key({element}) {
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

    @call
    add_house({name, rooms}) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        this.unorderedSet.set(house)
    }

    @view
    house_exist({name, rooms}) {
        let house = new House(name, [])
        for (let r of rooms) {
            house.rooms.push(new Room(r.name, r.size))
        }
        return this.unorderedSet.contains(house)
    }
}

