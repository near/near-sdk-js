import { GetOptions } from "../types/collections";
/**
 * A lookup set collection that stores entries in NEAR storage.
 */
export declare class LookupSet<DataType> {
    readonly keyPrefix: Uint8Array;
    /**
     * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(keyPrefix: Uint8Array);
    /**
     * Checks whether the collection contains the value.
     *
     * @param key - The value for which to check the presence.
     * @param options - Options for storing data.
     */
    contains(key: Uint8Array, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    /**
     * Returns true if the element was present in the set.
     *
     * @param key - The entry to remove.
     * @param options - Options for storing data.
     */
    remove(key: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    /**
     * If the set did not have this value present, `true` is returned.
     * If the set did have this value present, `false` is returned.
     *
     * @param key - The value to store in the collection.
     * @param options - Options for storing the data.
     */
    set(key: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param keys - The elements to extend the collection with.
     * @param options - Options for storing the data.
     */
    extend(keys: DataType[], options?: Pick<GetOptions<DataType>, "serializer">): void;
    /**
     * Serialize the collection.
     *
     * @param options - Options for storing the data.
     */
    serialize(options?: Pick<GetOptions<DataType>, "serializer">): Uint8Array;
    /**
     * Converts the deserialized data from storage to a JavaScript instance of the collection.
     *
     * @param data - The deserialized data to create an instance from.
     */
    static reconstruct<DataType>(data: LookupSet<unknown>): LookupSet<DataType>;
}
