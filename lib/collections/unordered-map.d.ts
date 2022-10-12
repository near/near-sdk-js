import { Bytes } from "../utils";
import { Vector } from "./vector";
import { LookupMap } from "./lookup-map";
import { GetOptions } from "../types/collections";
declare type ValueAndIndex = [value: string, index: number];
/**
 * An unordered map that stores data in NEAR storage.
 */
export declare class UnorderedMap<DataType> {
    readonly prefix: Bytes;
    readonly keys: Vector<Bytes>;
    readonly values: LookupMap<ValueAndIndex>;
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(prefix: Bytes);
    /**
     * The number of elements stored in the collection.
     */
    get length(): number;
    /**
     * Checks whether the collection is empty.
     */
    isEmpty(): boolean;
    /**
     * Get the data stored at the provided key.
     *
     * @param key - The key at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(key: Bytes, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Store a new value at the provided key.
     *
     * @param key - The key at which to store in the collection.
     * @param value - The value to store in the collection.
     * @param options - Options for retrieving and storing the data.
     */
    set(key: Bytes, value: DataType, options?: GetOptions<DataType>): DataType | null;
    /**
     * Removes and retrieves the element with the provided key.
     *
     * @param key - The key at which to remove data.
     * @param options - Options for retrieving the data.
     */
    remove(key: Bytes, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Remove all of the elements stored within the collection.
     */
    clear(): void;
    [Symbol.iterator](): UnorderedMapIterator<DataType>;
    /**
     * Create a iterator on top of the default collection iterator using custom options.
     *
     * @param options - Options for retrieving and storing the data.
     */
    private createIteratorWithOptions;
    /**
     * Return a JavaScript array of the data stored within the collection.
     *
     * @param options - Options for retrieving and storing the data.
     */
    toArray(options?: GetOptions<DataType>): [Bytes, DataType][];
    /**
     * Extends the current collection with the passed in array of key-value pairs.
     *
     * @param keyValuePairs - The key-value pairs to extend the collection with.
     */
    extend(keyValuePairs: [Bytes, DataType][]): void;
    /**
     * Serialize the collection.
     *
     * @param options - Options for storing the data.
     */
    serialize(options?: Pick<GetOptions<DataType>, "serializer">): string;
    /**
     * Converts the deserialized data from storage to a JavaScript instance of the collection.
     *
     * @param data - The deserialized data to create an instance from.
     */
    static reconstruct<DataType>(data: UnorderedMap<DataType>): UnorderedMap<DataType>;
}
/**
 * An iterator for the UnorderedMap collection.
 */
declare class UnorderedMapIterator<DataType> {
    private options?;
    private keys;
    private map;
    /**
     * @param unorderedMap - The unordered map collection to create an iterator for.
     * @param options - Options for retrieving and storing data.
     */
    constructor(unorderedMap: UnorderedMap<DataType>, options?: GetOptions<DataType>);
    next(): {
        value: [Bytes | null, DataType | null];
        done: boolean;
    };
}
export {};
