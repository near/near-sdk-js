import { NearContract, NearBindgen, near, call, view, LookupMap } from 'near-sdk-js'

class CarSpecs {
    id: number;
    color: string;
    price: number;
    engine: Engine;

    constructor(id: number, color: string, price: number, engine: Engine) {
        this.id = id;
        this.color = color;
        this.price = price;
        this.engine = engine as Engine;
    }
}

class Engine {
    hp: number;
  
    constructor(hp: number) {
      this.hp = hp;
    }

    run(): string {
        if (this.hp > 400) {
            return "boom"
        } else {
            return "zoom"
        }
    }
}

@NearBindgen
class ParkingLot extends NearContract {
    cars: LookupMap<CarSpecs>;
    constructor() {
        super()
        this.cars = new LookupMap<CarSpecs>('a');
    }

    deserialize() {
        this.cars = new LookupMap<CarSpecs>('a');
    }

    @call
    addCar({ name, specs }: { name: string, specs: CarSpecs }) {
        near.log(`addCar() called, name: ${name}, specs: ${JSON.stringify(specs)}`)
        this.cars.insert(name, specs)
    }

    @call
    removeCar({ name }: { name: string }) {
        near.log(`removeCar() called, name: ${name}`)
        this.cars.remove(name)
    }

    @view
    getCarSpecs({ name }: { name: string }) {
        near.log(`getCarSpecs() called, name: ${name}`)
        return this.cars.get(name)
    }

    @view
    runCar({name}: {name: string}) {
        let car = this.cars.get(name)
        return car.engine.run()
    }
}

