# Breaking features diff from SDK 2.0.0 to 1.0.0
## borsh data de/serializer for contract state
* using for: new contracts or migrate from a borsh serialized contract
[example](https://github.com/near/near-sdk-js/blob/develop/examples/src/status-message-borsh.js)
```js
@NearBindgen({
    serializer(statusMessage) {
        return borsh.serialize(schema, statusMessage);
    },
    deserializer(value) {
        return borsh.deserialize(schema, value);
    }
})
export class StatusMessage {
    constructor() {
        this.records = new Map()
    }

    @call({})
    set_status({ message }) {
        let account_id = near.signerAccountId()
        env.log(`${account_id} set_status with message ${message}`)
        this.records.set(account_id, message)
    }

    @view({})
    get_status({ account_id }) {
        env.log(`get_status for account_id ${account_id}`)
        return this.records.get(account_id) || null
    }
}
```

## js contract migration with data fields
* using for: contract state migrations
* [example](https://github.com/near/near-sdk-js/blob/develop/examples/src/status-message-migrate-add-field.js)
```js
import {NearBindgen, call, view, near, migrate, Vector, assert} from "near-sdk-js";

class OldStatusMessage {
  constructor() {
    this.records = {};
  }
}

@NearBindgen({})
export class StatusMessage {
  constructor() {
    this.records = {};
    this.new_fields = {}; // new added filed
  }
  ...

  // Migrate from OldStatusMessage to StatusMessage
  @migrate({})
  migrateState() {
    assert(this.records !== undefined, "Contract state should not be deserialized in @migrate");
    // retrieve the current state from the contract
    let records = JSON.parse(near.storageRead("STATE")).records;

    this.records = records;
    this.new_fields = {};
  }
}
```

## auto reconstruct class from object by static json schema
* use for contract serialzed by default method(json), the detail document is here: https://github.com/near/near-sdk-js/blob/develop/AUTO_RECONSCTRUCT_BY_JSON_SCHEME.md#the-schema-format
* [example](https://github.com/near/near-sdk-js/blob/develop/examples/src/status-deserialize-class.js#L49)
```js
class Car {
    static schema = {
        name: "string",
        speed: "number",
    };
    constructor() {
        this.name = "";
        this.speed = 0;
    }

    info() {
        return this.name + " run with speed " + this.speed.toString()
    }
}

class Truck {
    static schema = {
        name: "string",
        speed: "number",
        loads: UnorderedMap
    };
    constructor() {
        this.name = "";
        this.speed = 0;
        this.loads = new UnorderedMap("tra");
    }

    info() {
        return this.name + " run with speed " + this.speed.toString() + " with loads length: " + this.loads.toArray().length;
    }
}

// sdk should first try if UnorderedMap has a static schema and use it to recursively decode.
@NearBindgen({})
export class StatusDeserializeClass {
    static schema = {
        truck: Truck,
        efficient_recordes: UnorderedMap,
        nested_efficient_recordes: {class: UnorderedMap, value: UnorderedMap},
        nested_lookup_recordes:  {class: UnorderedMap, value: LookupMap},
        vector_nested_group: {class: Vector, value: LookupMap},
        lookup_nest_vec: { class: LookupMap, value: Vector },
        unordered_set: UnorderedSet,
        user_car_map: {class: UnorderedMap, value: Car },
        big_num: 'bigint',
        date: 'date'
    };
    constructor() {
        this.is_inited = false;
        this.records = {};
        this.truck = new Truck();
        this.messages = [];
        this.efficient_recordes = new UnorderedMap("a");
        this.nested_efficient_recordes = new UnorderedMap("b");
        this.nested_lookup_recordes = new UnorderedMap("c");
        this.vector_nested_group = new Vector("d");
        this.lookup_nest_vec = new LookupMap("e");
        this.unordered_set = new UnorderedSet("f");
        this.user_car_map = new UnorderedMap("g");
        this.big_num = 1n;
        this.date = new Date();
        this.message_without_schema_defined = "";
        this.number_without_schema_defined = 0;
        this.records_without_schema_defined = {};
    }
    ...
}
```

## query data Nesting of objects in SDK Collections without Nested Collection's reconstructor
* using for SDK Collections which has description in static json schema
In [near-sdk-js 1.0.0](https://www.npmjs.com/package/near-sdk-js/v/1.0.0), users needed to call a `reconstructor` method in order for **Nested Collections** to be properly decoded:
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
In [near-sdk-js 2.0.0](https://www.npmjs.com/package/near-sdk-js/v/2.0.0) With schemas, this is no longer needed, as the SDK can correctly infer how to decode the Nested Collections:

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
