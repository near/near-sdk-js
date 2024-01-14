import { GetOptions } from "../types/collections";
export declare abstract class SubType<DataType> {
    subtype(): any;
    set_reconstructor(options?: Omit<GetOptions<DataType>, "serializer">): Omit<GetOptions<DataType>, "serializer">;
}
