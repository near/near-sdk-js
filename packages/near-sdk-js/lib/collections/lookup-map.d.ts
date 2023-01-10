import { GetOptions } from "../types/collections";
/**
 * A lookup map that stores data in NEAR storage.
 */
export declare class LookupMap<DataType> {
    readonly keyPrefix: string;
    /**
     * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(keyPrefix: string);
    /**
     * Checks whether the collection contains the value.
     *
     * @param key - The value for which to check the presence.
     */
    containsKey(key: string): boolean;
    /**
     * Get the data stored at the provided key.
     *
     * @param key - The key at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(key: string, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Removes and retrieves the element with the provided key.
     *
     * @param key - The key at which to remove data.
     * @param options - Options for retrieving the data.
     */
    remove(key: string, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Store a new value at the provided key.
     *
     * @param key - The key at which to store in the collection.
     * @param newValue - The value to store in the collection.
     * @param options - Options for retrieving and storing the data.
     */
    set(key: string, newValue: DataType, options?: GetOptions<DataType>): DataType | null;
    /**
     * Extends the current collection with the passed in array of key-value pairs.
     *
     * @param keyValuePairs - The key-value pairs to extend the collection with.
     * @param options - Options for storing the data.
     */
    extend(keyValuePairs: [string, DataType][], options?: GetOptions<DataType>): void;
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
    static reconstruct<DataType>(data: LookupMap<unknown>): LookupMap<DataType>;
}
