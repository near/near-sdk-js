export class NearContract {
    deserialize() {
        let hasRead = env.jsvm_storage_read('STATE', 0)
        if (hasRead != 0) {
            let state = env.read_register(0)
            Object.assign(this, JSON.parse(state))
        } else
            throw new Error('Contract state is empty')
    }

    serialize() {
        env.jsvm_storage_write('STATE', JSON.stringify(this), 0)
    }

    static deserializeArgs() {
        env.jsvm_args(0)
        let args = env.read_register(0)
        return JSON.parse(args || '[]')
    }

    static serializeReturn(ret) {

    }
}

export function call (target, name, descriptor) {
    let oldMethod = descriptor.value
    descriptor.value = function() {
        target.deserialize()
        let args = target.constructor.deserializeArgs()
        let ret = oldMethod.apply(target, args)
        target.serialize()
        return ret
    }
    return descriptor
}

export function view (target, name, descriptor) {
    let oldMethod = descriptor.value
    descriptor.value = function() {
        target.deserialize()
        let args = target.constructor.deserializeArgs()
        return oldMethod.apply(target, args)
    }
    return descriptor
}

export function NearBindgen (Class) {
    let OriginalClass = Class
    let NewClass = function() {
        let args = OriginalClass.deserializeArgs()
        let ret = new OriginalClass(...args)
        ret.serialize()
        return ret
    }
    NewClass.prototype = OriginalClass.prototype
    NewClass._get = function() {
        let ret = new OriginalClass()
        return ret
    }

    return NewClass
}
