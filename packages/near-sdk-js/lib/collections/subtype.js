export class SubType {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/no-empty-function */
    subtype() { }
    set_reconstructor(options) {
        if (options == undefined) {
            options = {};
        }
        const subtype = this.subtype();
        if (options.reconstructor == undefined && subtype != undefined) {
            if (
            // eslint-disable-next-line no-prototype-builtins
            subtype.hasOwnProperty("class") &&
                typeof subtype.class.reconstruct === "function") {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                options.reconstructor = subtype.class.reconstruct;
            }
            else if (typeof subtype.reconstruct === "function") {
                options.reconstructor = subtype.reconstruct;
            }
        }
        return options;
    }
}
