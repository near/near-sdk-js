import { NearBindgen, LookupMap } from 'near-sdk-js'


@NearBindgen({})
export class ConstructorValidation {
    map: LookupMap<string>;
    name: string;
}