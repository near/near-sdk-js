export class House {
  constructor(name, rooms) {
    this.name = name
    this.rooms = rooms
  }

  describe() {
    return `house ${this.name} has ${this.rooms.length} rooms. `
  }
}

export class Room {
  constructor(name, size) {
    this.name = name
    this.size = size
  }

  describe() {
    return `room ${this.name} is ${this.size}.`
  }
}
