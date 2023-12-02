import {
    NearBindgen,
    call,
    view,
    near,
    UnorderedMap,
    serialize,
    decode,
    deserialize,
    encode,
    LookupMap,
    Vector,
    UnorderedSet, decodeObj2class
} from "near-sdk-js";
import lodash from "lodash-es";

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

class InnerStatusDeserializeClass {
    static schema = {
        records: {map: { key: 'string', value: 'string' }},
        car: Car,
        messages: {array: {value: 'string'}},
        efficient_recordes: {unordered_map: {value: 'string'}},
        nested_efficient_recordes: {unordered_map: {value: { unordered_map: {value: 'string'}}}},
        nested_lookup_recordes: {unordered_map: {value: { lookup_map: {value: 'string'}}}},
        vector_nested_group: {vector: {value: { lookup_map: {value: 'string'}}}},
        lookup_nest_vec: {lookup_map: {value: { vector: { value: 'string' }}}},
        unordered_set: {unordered_set: {value: 'string'}},
    };
    constructor() {
        this.records = {};
        this.car = new Car();
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
    }
}

@NearBindgen({})
export class StatusDeserializeClass {
    constructor() {
        this.messages = "";
    }

    @call({})
    init_messages({ }) {
        if (this.messages.length != 0) {
            near.log(`message inited`);
            return;
        }
        let account_id = near.signerAccountId();
        near.log(`${account_id} init_messages`);
        let status = new InnerStatusDeserializeClass();
        let data = serialize(status)
        this.messages = decode(data);
    }

    @view({})
    is_message_inited({}) {
        near.log(`query is_message_inited`);
        return this.messages.length != 0;
    }

    @call({})
    set_record({ message }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} set_status with message ${message}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        inst.records[account_id] = message;
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_record({ account_id }) {
        near.log(`get_record for account_id ${account_id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.records[account_id] || null;
    }


    @call({})
    set_car_info({ name, speed }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} set_car_info name ${name}, speed ${speed}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        inst.car.name = name;
        inst.car.speed = speed;
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_car_info({ }) {
        near.log(`get_car_info`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.car.info();
    }

    @call({})
    push_message({ message }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} push_message message ${message}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        inst.messages.push(message);
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_messages({ }) {
        near.log(`get_messages`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.messages.join(',');
    }

    @call({})
    set_nested_efficient_recordes({ message, id }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} set_nested_efficient_recordes with message ${message},id ${id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        inst.efficient_recordes.set(account_id, message);
        const nestedMap = inst.nested_efficient_recordes.get(id, {
            defaultValue: new UnorderedMap("i_" + id + "_"),
        });
        nestedMap.set(account_id, message);
        inst.nested_efficient_recordes.set(id, nestedMap);

        const nestedLookup = inst.nested_lookup_recordes.get(id, {
            defaultValue: new LookupMap("li_" + id + "_"),
        });
        nestedLookup.set(account_id, message);
        inst.nested_lookup_recordes.set(id, nestedLookup);

        // vector_nested_group: {vector: {value: { lookup_map: {value: 'string'}}}},
        const vecNestedLookup = inst.vector_nested_group.get(0, {
            defaultValue: new LookupMap("di_0_"),
        });
        vecNestedLookup.set(account_id, message);
        if (inst.vector_nested_group.isEmpty()) {
            inst.vector_nested_group.push(vecNestedLookup);
        } else {
            inst.vector_nested_group.replace(0, vecNestedLookup);
        }

        const lookupNestVec = inst.lookup_nest_vec.get(account_id, {
            defaultValue: new Vector("ei_" + account_id + "_"),
        });
        lookupNestVec.push(message);
        inst.lookup_nest_vec.set(account_id, lookupNestVec);

        inst.unordered_set.set(account_id);

        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_efficient_recordes({ account_id }) {
        near.log(`get_efficient_recordes for account_id ${account_id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.efficient_recordes.get(account_id);
    }

    @view({})
    get_nested_efficient_recordes({ account_id, id }) {
        near.log(`get_nested_efficient_recordes for account_id ${account_id}, id ${id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_efficient_recordes.get(id, {
            defaultValue: new UnorderedMap("i_" + id + "_"),
        }).get(account_id);
    }

    @view({})
    get_nested_lookup_recordes({ account_id, id }) {
        near.log(`get_nested_lookup_recordes for account_id ${account_id}, id ${id}`);
        near.log(this.messages);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_lookup_recordes.get(id, {
            defaultValue: new LookupMap("li_" + id + "_"),
        }).get(account_id);
    }

    @view({})
    get_vector_nested_group({ idx, account_id }) {
        near.log(`get_vector_nested_group for idx ${idx}, account_id ${account_id}`);
        near.log(this.messages);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.vector_nested_group.get(idx).get(account_id);
    }

    @view({})
    get_lookup_nested_vec({ account_id, idx }) {
        near.log(`get_looup_nested_vec for account_id ${account_id}, idx ${idx}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.lookup_nest_vec.get(account_id).get(idx);
    }

    @view({})
    get_is_contains_user({ account_id }) {
        near.log(`get_is_contains_user for account_id ${account_id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.unordered_set.contains(account_id);
    }

    @view({})
    get_subtype_of_efficient_recordes({  }) {
        near.log(`get_subtype_of_efficient_recordes`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.efficient_recordes.subtype();
    }

    @view({})
    get_subtype_of_nested_efficient_recordes({  }) {
        near.log(`get_subtype_of_nested_efficient_recordes`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_efficient_recordes.subtype();
    }

    @view({})
    get_subtype_of_nested_lookup_recordes({  }) {
        near.log(`get_subtype_of_nested_lookup_recordes`);
        let obj = deserialize(encode(this.messages));
        let inst = decodeObj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_lookup_recordes.subtype();
    }
}
