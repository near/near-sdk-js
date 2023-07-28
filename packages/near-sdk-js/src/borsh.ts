import * as borsh from 'borsh';
import {Schema} from "borsh";
import {DecodeTypes} from "borsh/lib/types/types";
export function borshSerialize(schema: Schema, value: unknown, checkSchema?: boolean): Uint8Array {
    return borsh.serialize(schema, value, checkSchema);
}
export function borshDeserialize(schema: Schema, buffer: Uint8Array, checkSchema?: boolean): DecodeTypes {
    return borsh.deserialize(schema, buffer, checkSchema);
}