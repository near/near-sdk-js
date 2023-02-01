import { Vector, VectorIterator } from "./vector";
import { GetOptions } from "../types/collections";
/**
 * An unordered set that stores data in NEAR storage.
 */
export declare class UnorderedSet<DataType> {
    readonly prefix: string;
    readonly elementIndexPrefix: string;
    readonly _elements: Vector<DataType>;
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     */
    constructor(prefix: string);
    /**
     * The number of elements stored in the collection.
     */
    get length(): number;
    /**
     * Checks whether the collection is empty.
     */
    isEmpty(): boolean;
    /**
     * Checks whether the collection contains the value.
     *
     * @param element - The value for which to check the presence.
     * @param options - Options for storing data.
     */
    contains(element: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    /**
     * If the set did not have this value present, `true` is returned.
     * If the set did have this value present, `false` is returned.
     *
     * @param element - The value to store in the collection.
     * @param options - Options for storing the data.
     */
    set(element: DataType, options?: Pick<GetOptions<DataType>, "serializer">): boolean;
    /**
     * Returns true if the element was present in the set.
     *
     * @param element - The entry to remove.
     * @param options - Options for retrieving and storing data.
     */
    remove(element: DataType, options?: GetOptions<DataType>): boolean;
    /**
     * Remove all of the elements stored within the collection.
     */
    clear(options?: Pick<GetOptions<DataType>, "serializer">): void;
    [Symbol.iterator](): VectorIterator<DataType>;
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
    toArray(options?: GetOptions<DataType>): DataType[];
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements: DataType[]): void;
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
    static reconstruct<DataType>(data: UnorderedSet<DataType>): UnorderedSet<DataType>;
    elements({ options, start, limit }: {
        options?: GetOptions<DataType>;
        start?: number;
        limit?: number;
    }): DataType[];
}
