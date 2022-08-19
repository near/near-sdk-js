export function call(target, key, descriptor) {
}
export function view(target, key, descriptor) {
}
export function NearBindgen(target) {
    return class extends target {
        static _get() {
            let ret = Object.create(target.prototype);
            return ret;
        }
    };
}
