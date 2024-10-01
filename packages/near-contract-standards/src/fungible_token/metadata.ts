import {
    assert,
} from "near-sdk-js";

import { Option } from "../non_fungible_token/utils";

const FT_METADATA_SPEC: string = "ft-1.0.0";

/**
 * Return metadata for the token, up to contract to implement.
 */
export class FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon: Option<string>;
    reference: Option<string>;
    reference_hash: Option<Uint8Array>;
    decimals: number;

    constructor(
        spec: string,
        name: string,
        symbol: string,
        icon: Option<string>,
        referance: Option<string>,
        referance_hash: Option<Uint8Array>,
        decimals: number,
    ) {
        this.spec = spec;
        this.name = name;
        this.symbol = symbol;
        this.icon = icon;
        this.reference = referance;
        this.reference_hash = referance_hash;
        this.decimals = decimals;
    }

    assert_valid() {
        assert(this.spec == FT_METADATA_SPEC, "Invalid FT_METADATA_SPEC");
        const isReferenceProvided: boolean = this.reference ? true : false;
        const isReferenceHashProvided: boolean = this.reference_hash ? true : false;
        assert(isReferenceHashProvided === isReferenceProvided, "reference and reference_hash must be either both provided or not");
        if (this.reference_hash) {
            assert(this.reference_hash.length === 32, "reference_hash must be 32 bytes");
        }
    }
}

export interface FungibleTokenMetadataProvider {
    ft_metadata() : FungibleTokenMetadata;
}
