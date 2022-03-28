export function call (target, name, descriptor) {
    let oldMethod = descriptor.value
    descriptor.value = function() {
        target.deserialize()
        let args = target.constructor.deserializeArgs()
        let ret = oldMethod.apply(target, args)
        target.serialize()
        if (ret !== undefined) {
            env.jsvm_value_return(target.constructor.serializeReturn(ret))
        }
    }
    return descriptor
}

export function view (target, name, descriptor) {
    let oldMethod = descriptor.value
    descriptor.value = function() {
        target.deserialize()
        let args = target.constructor.deserializeArgs()
        let ret = oldMethod.apply(target, args)
        if (ret !== undefined) {
            env.jsvm_value_return(target.constructor.serializeReturn(ret))
        }
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
