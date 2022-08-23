export function call (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}

export function view (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>): void {
}


export function NearBindgen<T extends { new(...args: any[]): {}}>(target: T) {
    return class extends target {
        static _get() {
            let ret = Object.create(target.prototype)
            return ret
        }
    }
}
