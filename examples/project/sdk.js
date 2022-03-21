export class NearContract {
    deserialize() {
        console.log('deserialize')
        return
        let hasRead = env.jsvm_storage_read('STATE', 0)
        if (hasRead != 0)
            Object.assign(this, JSON.parse(env.read_register(0)))
        else
            throw new Error('Contract state is empty')
    }

    serialize() {
        console.log('serialize')
        return
        env.jsvm_storage_write('STATE', JSON.stringify(this), 0)
    }
}

let callMethods = {}
let viewMethods = {}

export function call (target, name, descriptor) {
    let oldMethod = descriptor.value
    // console.log(target)
    // console.log(name)
    if (!target.__near) {
        target.__near = {}
    }
    target.__near[name] = 'call'
    // console.log(descriptor)
    descriptor.value = function(...args) {
        let ret = oldMethod.apply(target, args)
        target.serialize()
        return ret
    }
    return descriptor
}

export function view (target, name, descriptor) {
    let oldMethod = descriptor.value
    descriptor.value = function(...args) {
        return oldMethod.apply(target, args)
    }
    return descriptor
}

export function NearBindgen (Class) {
    let OriginalClass = Class
    // callMethods[Class.name] = {}
    // viewMethods[Class.name] = {}
    // console.log('---')
    // console.log(Class.prototype.__near)
    // console.log(Class.prototype.increaseTotal)

    // console.log(Object.getOwnPropertyDescriptors(Class.prototype))
    let NewClass = function(...args) {
        let ret = new OriginalClass(...args)
        ret.serialize()
        return ret
    }
    NewClass.prototype = OriginalClass.prototype
    NewClass._get = function() {
        let ret = new OriginalClass()
        ret.deserialize()
        return ret
    }

    // export function testIncrease() {
    //     let m = NewClass.get()
    //     m.increaseTotal()
    //     // env.log(m.getTotal())
    // }
    // console.log(callMethods)
    return NewClass
}
