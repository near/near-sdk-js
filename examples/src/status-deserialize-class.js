import {NearBindgen, call, view, near, UnorderedMap, serialize, decode, deserialize, encode} from "near-sdk-js";
import lodash from "lodash-es";

function decode_obj2class(class_instance, obj) {
    let key;
    for (key in obj) {
        // @ts-ignore
        let value = obj[key];
        near.log("decodeNested filed, key:  ", key, " value: ", value, "instance[", key, "]: ", class_instance[key]);
        if (typeof value == 'object') {
            near.log("object fields, object key: ", key, " value: ", value);
            // @ts-ignore
            let ty = class_instance.constructor.schema[key];
            if (ty !== undefined && ty.hasOwnProperty("map")) {
                near.log("map type");
                for (let mkey in value) {
                    if (ty["map"]["value"]==='string') {
                        class_instance[key][mkey] = value[mkey];
                    } else {
                        class_instance[key][mkey] = decode_obj2class(new ty["map"]["value"](), value[mkey]);
                    }
                }
            } else if (ty !== undefined && ty.hasOwnProperty("array")) {
                near.log("vector type");
                for (let k in value) {
                    if (ty["array"]["value"]==='string') {
                        class_instance[key].push(value[k]);
                    } else {
                        class_instance[key].push(decode_obj2class(new ty["array"]["value"](), value[k]));
                    }
                }
            } else if (ty !== undefined && ty.hasOwnProperty("unorder_map")) {
                class_instance[key].constructor.schema = ty;
                let subtype_value = ty["unorder_map"]["value"];
                class_instance[key].subtype = function () {
                    return subtype_value;
                }
                // class_instance[key] = decode_obj2class(class_instance[key], obj[key]);
            } else if (ty !== undefined && ty.hasOwnProperty("vector")) {
                // todo: imple
            } else if (ty !== undefined && ty.hasOwnProperty("unorder_set")) {
                // todo: imple
            } else if (ty !== undefined && ty.hasOwnProperty("lookup_map")) {
                // todo: impl
            } else if (ty !== undefined && ty.hasOwnProperty("lookup_set")) {
                // todo: impl
            } else {
                // normal case
                class_instance[key].constructor.schema = class_instance.constructor.schema[key];
                class_instance[key] = decode_obj2class(class_instance[key], obj[key]);
            }
            near.log("instance[key] value", class_instance[key]);
        }
    }
    const instance_tmp = lodash.cloneDeep(class_instance);
    class_instance = Object.assign(class_instance, obj);
    for (key in obj) {
        if (typeof class_instance[key] == 'object') {
            class_instance[key] = instance_tmp[key];
        }
    }
    near.log("current instance: ", class_instance);
    return class_instance;
}

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
        efficient_recordes: {unorder_map: {value: 'string'}},
        nested_efficient_recordes: {unorder_map: {value: { unorder_map: {value: 'string'}}}}
    };
    constructor() {
        this.records = {};
        this.car = new Car();
        this.messages = [];
        // account_id -> message
        this.efficient_recordes = new UnorderedMap("a");
        // id -> account_id -> message
        this.nested_efficient_recordes = new UnorderedMap("b");
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
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        inst.records[account_id] = message;
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_record({ account_id }) {
        near.log(`get_record for account_id ${account_id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.records[account_id] || null;
    }


    @call({})
    set_car_info({ name, speed }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} set_car_info name ${name}, speed ${speed}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        inst.car.name = name;
        inst.car.speed = speed;
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_car_info({ }) {
        near.log(`get_car_info`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.car.info();
    }

    @call({})
    push_message({ message }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} push_message message ${message}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        inst.messages.push(message);
        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_messages({ }) {
        near.log(`get_messages`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.messages.join(',');
    }

    @call({})
    set_nested_efficient_recordes({ message, id }) {
        let account_id = near.signerAccountId();
        near.log(`${account_id} set_nested_efficient_recordes with message ${message},id ${id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        inst.efficient_recordes.set(account_id, message);
        const nestedMap = inst.nested_efficient_recordes.get(id, {
            defaultValue: new UnorderedMap("i_" + id + "_"),
        });
        nestedMap.set(near.signerAccountId(), message);
        inst.nested_efficient_recordes.set(id, nestedMap);

        let data = serialize(inst)
        this.messages = decode(data);
    }

    @view({})
    get_efficient_recordes({ account_id }) {
        near.log(`get_efficient_recordes for account_id ${account_id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.efficient_recordes.get(account_id);
    }

    @view({})
    get_nested_efficient_recordes({ account_id, id }) {
        near.log(`get_nested_efficient_recordes for account_id ${account_id}, id ${id}`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_efficient_recordes.get(id, {
            defaultValue: new UnorderedMap("i_" + id + "_"),
        }).get(account_id);
    }

    @view({})
    get_subtype_of_efficient_recordes({  }) {
        near.log(`get_subtype_of_efficient_recordes`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.efficient_recordes.subtype();
    }

    @view({})
    get_subtype_of_nested_efficient_recordes({  }) {
        near.log(`get_subtype_of_nested_efficient_recordes`);
        let obj = deserialize(encode(this.messages));
        let inst = decode_obj2class(new InnerStatusDeserializeClass(), obj);
        return inst.nested_efficient_recordes.subtype();
    }
}
