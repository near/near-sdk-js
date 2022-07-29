import { NearContract, NearBindgen, near, call, view, LookupMap } from 'near-sdk-js'

class CarSpecs {
    id: number;
    color: string;
    price: number;

    constructor(id: number, color: string, price: number) {
        this.id = id;
        this.color = color;
        this.price = price;
    }
}

@NearBindgen
class ParkingLot extends NearContract {
    cars: LookupMap<CarSpecs>;
    constructor() {
        super()
        this.cars = new LookupMap<CarSpecs>('a');
    }

    @call
    addCar({ name }: { name: string }, { specs }: { specs: CarSpecs }) {
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
        this.cars.get(name)
    }
}

