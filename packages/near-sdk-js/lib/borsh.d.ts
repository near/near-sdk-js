import { Schema } from "borsh";
import { DecodeTypes } from "borsh/lib/types/types";
export declare function borshSerialize(schema: Schema, value: unknown, checkSchema?: boolean): Uint8Array;
export declare function borshDeserialize(schema: Schema, buffer: Uint8Array, checkSchema?: boolean): DecodeTypes;
