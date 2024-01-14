export class SubType {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/no-empty-function */
    subtype() { }
    set_reconstructor(options) {
        if (options == undefined) {
            options = {};
        }
        const subtype = this.subtype();
        if (options.reconstructor == undefined &&
            subtype != undefined &&
            // eslint-disable-next-line no-prototype-builtins
            subtype.hasOwnProperty("collection") &&
            typeof this.subtype().collection.reconstructor === "function") {
            // { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            options.reconstructor = this.subtype().collection.reconstructor;
        }
        return options;
    }
}
