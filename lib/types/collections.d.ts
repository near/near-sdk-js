/**
 * Options for retrieving and storing data in the SDK collections.
 */
export interface GetOptions<DataType> {
    /**
     * A constructor function to call after deserializing a value. Tipically this is a constructor of the class you are storing.
     *
     * @param value - The value returned from deserialization - either the provided `deserializer` or default deserialization function.
     */
    reconstructor?(value: unknown): DataType;
    /**
     * A default value to return if the original value is not present or null.
     */
    defaultValue?: DataType;
    /**
     * A serializer function to customize the serialization of the collection for this call.
     *
     * @param valueToSerialize - The value that will be serialized - either the `DataType` or a unknown value.
     */
    serializer?(valueToSerialize: unknown): string;
    /**
     * A deserializer function to customize the deserialization of values after reading from NEAR storage for this call.
     *
     * @param valueToDeserialize - The string retrieved from NEAR storage to deserialize.
     */
    deserializer?(valueToDeserialize: string): unknown;
}
