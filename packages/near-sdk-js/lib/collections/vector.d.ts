import { GetOptions } from "../types/collections";
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
export declare class Vector<DataType> {
    readonly prefix: string;
    length: number;
    /**
     * @param prefix - The byte prefix to use when storing elements inside this collection.
     * @param length - The initial length of the collection. By default 0.
     */
    constructor(prefix: string, length?: number);
    /**
     * Checks whether the collection is empty.
     */
    isEmpty(): boolean;
    subtype(): any;
    set_reconstructor(options?: Omit<GetOptions<DataType>, "serializer">): Omit<GetOptions<DataType>, "serializer">;
    /**
     * Get the data stored at the provided index.
     *
     * @param index - The index at which to look for the data.
     * @param options - Options for retrieving the data.
     */
    get(index: number, options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Removes an element from the vector and returns it in serialized form.
     * The removed element is replaced by the last element of the vector.
     * Does not preserve ordering, but is `O(1)`.
     *
     * @param index - The index at which to remove the element.
     * @param options - Options for retrieving and storing the data.
     */
    swapRemove(index: number, options?: GetOptions<DataType>): DataType | null;
    /**
     * Adds data to the collection.
     *
     * @param element - The data to store.
     * @param options - Options for storing the data.
     */
    push(element: DataType, options?: Pick<GetOptions<DataType>, "serializer">): void;
    /**
     * Removes and retrieves the element with the highest index.
     *
     * @param options - Options for retrieving the data.
     */
    pop(options?: Omit<GetOptions<DataType>, "serializer">): DataType | null;
    /**
     * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
     *
     * @param index - The index at which to replace the data.
     * @param element - The data to replace with.
     * @param options - Options for retrieving and storing the data.
     */
    replace(index: number, element: DataType, options?: GetOptions<DataType>): DataType;
    /**
     * Extends the current collection with the passed in array of elements.
     *
     * @param elements - The elements to extend the collection with.
     */
    extend(elements: DataType[]): void;
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
     * Remove all of the elements stored within the collection.
     */
    clear(): void;
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
    static reconstruct<DataType>(data: Vector<DataType>): Vector<DataType>;
}
/**
 * An iterator for the Vector collection.
 */
export declare class VectorIterator<DataType> {
    private vector;
    private readonly options?;
    private current;
    /**
     * @param vector - The vector collection to create an iterator for.
     * @param options - Options for retrieving and storing data.
     */
    constructor(vector: Vector<DataType>, options?: GetOptions<DataType>);
    next(): {
        value: DataType | null;
        done: boolean;
    };
}
