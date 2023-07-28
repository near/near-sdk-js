import * as borsh from 'borsh';
export function borshSerialize(schema, value, checkSchema) {
    return borsh.serialize(schema, value, checkSchema);
}
export function borshDeserialize(schema, buffer, checkSchema) {
    return borsh.deserialize(schema, buffer, checkSchema);
}
