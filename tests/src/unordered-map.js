import {
    NearContract,
    NearBindgen,
    call,
    view,
    UnorderedMap,
    Vector
} from 'near-sdk-js'
import {House, Room} from './model.js';

@NearBindgen
class UnorderedMapTestContract extends NearContract {
    constructor() {
        super()
        this.unorderedMap = new UnorderedMap('a');
    }

    default() {
        return new UnorderedMapTestContract();
    }

    @view
    len() {
        return this.unorderedMap.len();
    }

    @view
    isEmpty() {
        return this.unorderedMap.isEmpty();
    }

    @view
    serializeIndex({index}) {
        return this.unorderedMap.serializeIndex(index);
    }

    @view
    deserializeIndex({rawIndex}) {
        return this.unorderedMap.deserializeIndex(rawIndex);
    }

    @view
    getIndexRaw({key}) {
        return this.unorderedMap.getIndexRaw(key);
    }

    @view
    get({key}) {
        return this.unorderedMap.get(key);
    }

    @call
    set({key, value}) {
        this.unorderedMap.set(key, value);
    }

    @call
    remove_key({key}) {
        this.unorderedMap.remove(key);
    }

    @call
    clear() {
        this.unorderedMap.clear();
    }

    @view
    toArray() {
        return this.unorderedMap.toArray();
    }

    @call
    extend({kvs}) {
        this.unorderedMap.extend(kvs);
    }

    @call
    add_house() {
        this.unorderedMap.set('house1', new House('house1', [new Room('room1', '200sqft'), new Room('room2', '300sqft')]))
    }

    @view
    get_house() {
        const rawHouse = this.unorderedMap.get('house1')
        const house = new House(rawHouse.name, rawHouse.rooms)
        const rawRoom = house.rooms[0]
        const room = new Room(rawRoom.name, rawRoom.size)
        return house.describe() + room.describe()
    }
}

