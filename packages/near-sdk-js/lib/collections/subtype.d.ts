import { GetOptions } from "../types/collections";
export declare const LOOKUP_MAP_SCHE = "lookup_map";
export declare const LOOKUP_SET_SCHE = "lookup_set";
export declare const UNORDERED_MAP_SCHE = "unordered_map";
export declare const UNORDERED_SET_SCHE = "unordered_set";
export declare const VECTOR_SCHE = "vector";
export declare abstract class SubType<DataType> {
    subtype(): any;
    set_reconstructor(options?: Omit<GetOptions<DataType>, "serializer">): Omit<GetOptions<DataType>, "serializer">;
}
