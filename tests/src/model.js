/**
 * Simple model used for testing.
 * - Includes methods:
 *  - `describe()` - returns a string `house ${this.name} has ${this.rooms.length} rooms.`
 * @param name - Simple `string` used for testing.
 * @param rooms - Simple `Room[]` used for testing.
 */
export class House {
  constructor(name, rooms) {
    this.name = name;
    this.rooms = rooms;
  }

  describe() {
    return `house ${this.name} has ${this.rooms.length} rooms. `;
  }
}

/**
 * Simple model used for testing.
 * - Includes methods:
 *  - `describe()` - returns a string `room ${this.name} is ${this.size}.`
 * @param name - Simple `string` used for testing.
 * @param size - Simple `number` used for testing.
 */
export class Room {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }

  describe() {
    return `room ${this.name} is ${this.size}.`;
  }
}
