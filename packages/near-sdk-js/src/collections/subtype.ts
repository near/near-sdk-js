import { GetOptions } from "../types/collections";

export abstract class SubType<DataType> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /* eslint-disable @typescript-eslint/no-empty-function */
  subtype(): any {}

  set_reconstructor(
    options?: Omit<GetOptions<DataType>, "serializer">
  ): Omit<GetOptions<DataType>, "serializer"> {
    if (options == undefined) {
      options = {};
    }
    const subtype = this.subtype();
    if (
      options.reconstructor == undefined &&
      subtype != undefined
    ) {
      if (
          // eslint-disable-next-line no-prototype-builtins
          subtype.hasOwnProperty("class") &&
          typeof subtype.class.reconstructor === "function") {
        // { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options.reconstructor = subtype.class.reconstructor;
      } else if (subtype.reconstructor === "function") {
        options.reconstructor = subtype.reconstructor;
      }
    }
    return options;
  }
}
