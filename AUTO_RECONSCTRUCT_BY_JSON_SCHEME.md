# Auto reconstruct by json schema
## Problem Solved: Could not decode contract state to class instance in early version of sdk
JS SDK decode contract as utf-8 and parse it as JSON, results in a JS Object.  
One thing not intuitive is objects are recovered as Object, not class instance. For example, Assume an instance of this class is stored in contract state:
```typescript
Class Car {
    name: string;
    speed: number;
    
    run() {
      // ...
    }
}
```
When load it back, the SDK gives us something like:
```json
{"name": "Audi", "speed": 200}
```
However this is a JS Object, not an instance of Car Class, and therefore you cannot call run method on it.  
This also applies to when user passes a JSON argument to a contract method. If the contract is written in TypeScript, although it may look like:
```typescript
add_a_car(car: Car) {
  car.run(); // doesn't work
  this.some_collection.set(car.name, car);
}
```
But car.run() doesn't work, because SDK only know how to deserialize it as a plain object, not a Car instance.  
This problem is particularly painful when class is nested, for example collection class instance LookupMap containing Car class instance. Currently SDK mitigate this problem by requires user to manually reconstruct the JS object to an instance of the original class.
## A method to decode string to class instance by json schema file
we just need to add static member in the class type.
```typescript
Class Car {
    static schema = {
        name: "string",
        speed: "number",
    };
    name: string;
    speed: number;
    
    run() {
      // ...
    }
}
```
After we add static member in the class type in our smart contract, it will auto reconstruct smart contract and it's member to class instance recursive by sdk.  
And we can call class's functions directly after it deserialized.
```js
add_a_car(car: Car) {
  car.run(); // it works!
  this.some_collection.set(car.name, car);
}
```
### The schema format
#### We support multiple type in schema:
* build-in non object types: `string`, `number`, `boolean`
* build-in object types: `Date`, `BigInt`. And we can skip those two build-in object types in schema info
* build-in collection types: `array`, `map`
  * for `array` type, we need to declare it in the format of `{array: {value: valueType}}`
  * for `map` type, we need to declare it in the format of `{map: {key: 'KeyType', value: 'valueType'}}`
* Custom Class types: `Car` or any class types
* Near collection class types: `Vector`, `LookupMap`, `LookupSet`, `UnorderedMap`, `UnorderedSet`, need to declare in the format of `{class: ClassType, value: ValueType}`
  * we can ignore `value` field if we don't need to auto reconstruct value to specific class. we often ignore `value` field if value tye are `string`, `number`, `boolean`
We have a test example which contains all those types in one schema: [status-deserialize-class.js](./examples/src/status-deserialize-class.js)
```js
export class StatusDeserializeClass {
  static schema = {
    is_inited: "boolean",
    records: {map: { key: 'string', value: 'string' }},
    truck: Truck,
    messages: {array: {value: 'string'}},
    efficient_recordes: {class: UnorderedMap},
    nested_efficient_recordes: {class: UnorderedMap, value: UnorderedMap},
    nested_lookup_recordes:  {class: UnorderedMap, value: {class: LookupMap }},
    vector_nested_group: {class: Vector, value: { class: LookupMap }},
    lookup_nest_vec: { class: LookupMap, value: Vector },
    unordered_set: {class: UnorderedSet },
    user_car_map: {class: UnorderedMap, value: Car },
    big_num: 'bigint',
    date: 'date'
  };
  constructor() {
    this.is_inited = false;
    this.records = {};
    this.truck = new Truck();
    this.messages = [];
    // account_id -> message
    this.efficient_recordes = new UnorderedMap("a");
    // id -> account_id -> message
    this.nested_efficient_recordes = new UnorderedMap("b");
    // id -> account_id -> message
    this.nested_lookup_recordes = new UnorderedMap("c");
    // index -> account_id -> message
    this.vector_nested_group = new Vector("d");
    // account_id -> index -> message
    this.lookup_nest_vec = new LookupMap("e");
    this.unordered_set = new UnorderedSet("f");
    this.user_car_map = new UnorderedMap("g");
    this.big_num = 1n;
    this.date = new Date();
    this.message_without_schema_defined = "";
    this.number_without_schema_defined = 0;
    this.records_without_schema_defined = {};
  }
    // other methods
}
```
#### Logic of auto reconstruct by json schema
The `_reconstruct` method in [near-bindgen.ts](./packages/near-sdk-js/src/near-bindgen.ts) will check whether there exit a schema in smart contract class, if there exist a static schema info, it will be decoded to class by invoking `decodeObj2class`, or it will fallback to previous behavior:
```typescript
  static _reconstruct(classObject: object, plainObject: AnyObject): object {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (classObject.constructor.schema === undefined) {
      for (const item in classObject) {
        const reconstructor = classObject[item].constructor?.reconstruct;
  
        classObject[item] = reconstructor
                ? reconstructor(plainObject[item])
                : plainObject[item];
      }
  
      return classObject;
    }
  
    return decodeObj2class(classObject, plainObject);
  }
```
#### no need to announce GetOptions.reconstructor in decoding nested collections
In this other hand, after we set schema for the Near collections with nested collections, we don't need to announce `reconstructor` when we need to get and decode a nested collections because the data type info in the schema will tell sdk what the nested data type.  
Before we set schema if we need to get a nested collection we need to set `reconstructor` in `GetOptions`:
```typescript
@NearBindgen({})
export class Contract {
    outerMap: UnorderedMap<UnorderedMap<string>>;

    constructor() {
        this.outerMap = new UnorderedMap("o");
    }

    @view({})
    get({id, accountId}: { id: string; accountId: string }) {
        const innerMap = this.outerMap.get(id, {
            reconstructor: UnorderedMap.reconstruct,  // we need to announce reconstructor explicit
        });
        if (innerMap === null) {
            return null;
        }
        return innerMap.get(accountId);
    }
}
```
After we set schema info we don't need to set `reconstructor` in `GetOptions` anymore, sdk can infer which reconstructor should be taken by the schema:
```typescript
@NearBindgen({})
export class Contract {
    static schema = {
      outerMap: {class: UnorderedMap, value: UnorderedMap}
    };
    
    outerMap: UnorderedMap<UnorderedMap<string>>;

    constructor() {
        this.outerMap = new UnorderedMap("o");
    }

    @view({})
    get({id, accountId}: { id: string; accountId: string }) {
        const innerMap = this.outerMap.get(id);  // reconstructor can be infered from static schema
        if (innerMap === null) {
            return null;
        }
        return innerMap.get(accountId);
    }
}
```
