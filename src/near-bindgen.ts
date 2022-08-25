export function call (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function view (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}


export function NearBindgen<T extends { new(...args: any[]): {}}>(target: T) {
    return class extends target {
        static _init() {
            // @ts-ignore
            let args = target.deserializeArgs()
            let ret = new target(args)
            // @ts-ignore
            ret.init()
            // @ts-ignore
            ret.serialize()
            return ret
        }

        static _get() {
            let ret = Object.create(target.prototype)
            return ret
        }

        static _default() { // TODO: can we use it?
            return new target({})
        }
    }
}
