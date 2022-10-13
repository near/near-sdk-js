import { NearBindgen, call, view, LookupMap } from 'near-sdk-js'
import { House, Room } from './model.js'

@NearBindgen({})
export class LookupMapTestContract {
  constructor() {
    this.lookupMap = new LookupMap('a')
  }

  @view({})
  get({ key }) {
    return this.lookupMap.get(key)
  }

  @view({})
  containsKey({ key }) {
    return this.lookupMap.containsKey(key)
  }

  @call({})
  set({ key, value }) {
    this.lookupMap.set(key, value)
  }

  @call({})
  remove_key({ key }) {
    this.lookupMap.remove(key)
  }

  @call({})
  extend({ kvs }) {
    this.lookupMap.extend(kvs)
  }

  @call({})
  add_house() {
    this.lookupMap.set('house1', new House('house1', [new Room('room1', '200sqft'), new Room('room2', '300sqft')]))
  }

  @view({})
  get_house() {
    const houseObject = this.lookupMap.get('house1')
    // restore class object from serialized data
    const house = new House(houseObject.name, houseObject.rooms)
    const roomObject = house.rooms[0]
    const room = new Room(roomObject.name, roomObject.size)
    return house.describe() + room.describe()
  }
}
