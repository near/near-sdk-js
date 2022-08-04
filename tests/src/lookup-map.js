import {
    NearContract,
    NearBindgen,
    call,
    view,
    LookupMap
} from 'near-sdk-js'
import {House, Room} from './model.js';

@NearBindgen
class LookupMapTestContract extends NearContract {
    constructor() {
        super()
        this.lookupMap = new LookupMap('a');
    }

    @view
    get({key}) {
        return this.lookupMap.get(key);
    }

    @view
    containsKey({key}) {
        return this.lookupMap.containsKey(key);
    }

    @call
    set({key, value}) {
        this.lookupMap.set(key, value);
    }

    @call
    remove_key({key}) {
        this.lookupMap.remove(key);
    }

    @call
    extend({kvs}) {
        this.lookupMap.extend(kvs);
    }

    @call
    add_house() {
        this.lookupMap.set('house1', new House('house1', [new Room('room1', '200sqft'), new Room('room2', '300sqft')]))
    }

    @view
    get_house() {
        let house = this.lookupMap.get('house1')
        let room = house.rooms[0]
        // ensure the object's class is preserved
        // if and only if house and room is still of class House and Room, this would work:
        return house.describe() + room.describe()
    }
}
