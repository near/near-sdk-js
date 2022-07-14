export function call (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function view (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function NearBindgen (Class) {
    let OriginalClass = Class
    let NewClass = function() {
        let args = OriginalClass.deserializeArgs()
        let ret = new OriginalClass(args)
        ret.serialize()
        return ret
    }
    NewClass.prototype = OriginalClass.prototype
    // @ts-ignore
    NewClass._get = function() {
        let ret = Object.create(NewClass.prototype)
        return ret
    }

    return NewClass
}
