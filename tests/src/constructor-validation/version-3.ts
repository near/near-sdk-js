import { NearBindgen, LookupMap } from 'near-sdk-js'


@NearBindgen({})
class ConstructorValidation {
    map: LookupMap<string>;
    name: string;
    constructor(){
    }
}