# JSON Schemas for Automatic Decoding of the State

A limitation that we early detected in the `near-sdk-js` is that Classes and Nested Structures (e.g. Vectors of Maps) are valid to declare as attributes of a contract, but hard to correctly deserialize.

This file explains a new solution currently implemented in the SDK and how to use it to simplify hanlding stored Classes and Nested Structures.

## The Problem
NEAR smart contracts store information in their state, which they read when an execution starts and write when an execution finished. In particular, all the information stored in the contract is (de)serialized as a `utf8` `JSON-String`.

Since Javascript does **not** handle types, it is actually very hard to infer the type of the data that is stored when the contract is loaded at the start of an execution. Imagine for example a contract storing a class `Car` defined as follows:

```typescript
Class Car {
    name: string;
    speed: number;
    
    run() {
      // ...
    }
}
```

A particular instance of that Car (e.g. new Car("Audi", 200)) will be stored in the contract as the JSON string:

```json
{"name": "Audi", "speed": 200}
```

Next time the contract is called, the state will be parsed using `JSON.parse()`, and the result will be an `Object {name: "Audi", speed:200}`, which is an instance of `object` and **not an instance of Car**. This would happen both if the user wrote the contract in `javascript` or `typescript`, since casting in `Typescript` is just sugarcoating, it does not actually cast the object! What this means is that:

```js
// the SDK parses the String into an Object
this.car.run() # This will fail!
```

This problem is particularly painful when the class is nested in another Class, e.g. a `LookupMap` of `Cars`.

## The (non-elegant) Solution
Before, the SDK mitigated this problem by requiring the user to manually reconstruct the JS `Object` to an instance of the original class.

## A More Elegant Solution: JSON Schemas
To help the SDK know which type it should decode, we can add a `static schema` map, which tells the SDK what type of data it should read:

```ts
Class Car {
    // Schema to (de)serialize
    static schema = {
        name: "string",
        speed: "number",
    };

    // Properties
    name: string;
    speed: number;

    // methods
    run() {
      // ...
    }
}
```

If a `Class` defines an schema, the SDK will recursively reconstruct it, by creating a new instance of `Car` and filling its attributes with the right values. In this way, the deserialized object will effectively be **an instance of the Class**. This means that we can call all its methods:

```js
// the SDK iteratively reconstructs the Car
this.car.run() # This now works!
```

## The schema format
The Schema supports multiple types: 

* Primitive types: `string`, `number`, `boolean`
* Built-in object types: `Date`, `BigInt`.
* Built-in collections: `array`, `map`
  * Arrays need to be declared as `{array: {value: valueType}}` 
  * Maps need to declared as `{map: {key: 'keyType', value: 'valueType'}}`
* Custom classes are denoted by their name, e.g. `Car`
* Near SDK Collections (i.e. `Vector`, `LookupMap`, `LookupSet`, `UnorderedMap`, `UnorderedSet`) need to be declared as `{class: ClassType, value: ValueType}`

You can see a complete example in the [status-deserialize-class](./examples/src/status-deserialize-class.js) file, which containts the following Class declaration:

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

---

#### What happens with the old `reconstructor`?
Until now, users needed to call a `reconstructor` method in order for **Nested Collections** to be properly decoded: 

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

With schemas, this is no longer needed, as the SDK can correctly infer how to decode the Nested Collections:

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

---

#### How Does the Reconstruction Work?
The `_reconstruct` method in [near-bindgen.ts](./packages/near-sdk-js/src/near-bindgen.ts) will check whether an schema exists in the **contract's class**. If such schema exists, it will try to decode it by invoking `decodeObj2class`:

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

