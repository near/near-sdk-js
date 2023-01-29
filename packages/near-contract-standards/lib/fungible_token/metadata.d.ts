import { Option } from "../non_fungible_token/utils";
export declare class FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon: Option<string>;
    reference: Option<string>;
    reference_hash: Option<Uint8Array>;
    decimals: number;
    constructor(spec: string, name: string, symbol: string, icon: Option<string>, referance: Option<string>, referance_hash: Option<Uint8Array>, decimals: number);
    assert_valid(): void;
}
export interface FungibleTokenMetadataProvider {
    ft_metadata(): FungibleTokenMetadata;
}
