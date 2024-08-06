// test import `BorshSchema`
import { BorshSchema, borshSerialize, borshDeserialize } from 'borsher';
const n = 100;
const buffer = borshSerialize(BorshSchema.u8, n);
