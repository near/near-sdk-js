import { GetOptions } from "../types/collections";

export const LOOKUP_MAP_SCHE = "lookup_map";
export const LOOKUP_SET_SCHE = "lookup_set";
export const UNORDERED_MAP_SCHE = "unordered_map";
export const UNORDERED_SET_SCHE = "unordered_set";
export const VECTOR_SCHE = "vector";

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
    // eslint-disable-next-line no-prototype-builtins
    if (
      options.reconstructor == undefined &&
      this.subtype() != undefined &&
      this.subtype().hasOwnProperty("collection")
    ) {
      // { collection: {reconstructor: LookupMap.reconstruct, value: 'string'}}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options.reconstructor = this.subtype()["reconstructor"];
    }
    return options;
  }
}
