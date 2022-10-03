export declare type GetOptions<DataType> = {
    reconstructor?(value: unknown): DataType;
    defaultValue?: DataType;
    serializer?(valueToSerialize: unknown): string;
    deserializer?(valueToDeserialize: string): unknown;
};
