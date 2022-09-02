import { NearBindgen, near, call, view, LookupMap } from 'near-sdk-js'

class CarSpecs {
    id: number;
    color: string;
    price: number;
    engine: Engine;

    constructor(id: number, color: string, price: number, engine: Engine) {
        this.id = id;
        this.color = color;
        this.price = price;
        this.engine = engine;
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

@NearBindgen({})
class ParkingLot {
    cars: LookupMap<CarSpecs>;
    constructor() {
        this.cars = new LookupMap<CarSpecs>('a');
    }

    @call
    addCar({ name, id, color, price, engineHp }: { name: string, id: number, color: string, price: number, engineHp: number }) {
        // args can be json arguments only, they cannot be of a JS/TS class like following, unless override NearContract.deserializeArgs method.
        // addCar({ name, specs }: { name: string, specs: CarSpecs }) {
        let engine = new Engine(engineHp)
        let car = new CarSpecs(id, color, price, engine);
        near.log(`addCar() called, name: ${name}, specs: ${JSON.stringify(car)}`)
        this.cars.set(name, car)
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
    runCar({ name }: { name: string }) {
        /* We are getting plain carSpecs object from the storage.
        It needs to be converted to the class object in order to execute engine.run() function.*/
        let carSpecs = this.cars.get(name) as CarSpecs;
        let engine = new Engine(carSpecs.engine.hp)
        return engine.run()
    }
}