export type GetOptions<DataType> = {
    reconstructor?: (value: unknown) => DataType
}