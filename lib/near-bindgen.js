export function call(target, key, descriptor) {
}
export function view(target, key, descriptor) {
}
export function NearBindgen(target) {
    return class extends target {
        static _init() {
            // @ts-ignore
            let args = target.deserializeArgs();
            let ret = new target(args);
            // @ts-ignore
            ret.init();
            // @ts-ignore
            ret.serialize();
            return ret;
        }
        static _get() {
            let ret = Object.create(target.prototype);
            return ret;
        }
    };
}
