import {
    assert,
} from "near-sdk-js";

import { Option } from "../non_fungible_token/utils";

const FT_METADATA_SPEC: string = "ft-1.0.0";

export class FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon: Option<string>;
    reference: Option<string>;
    reference_hash: Option<Uint8Array>;
    decimals: number;

    assert_valid() {
        assert(this.spec == FT_METADATA_SPEC, "Invalid FT_METADATA_SPEC");
        const isReferenceProvided = this.reference ? true : false;
        const isReferenceHashProvided = this.reference_hash ? true : false;
        assert(isReferenceHashProvided === isReferenceProvided, "reference and reference_hash must be either both provided or not");
        if (this.reference_hash) {
            assert(this.reference_hash.length === 32, "reference_hash must be 32 bytes");
        }
    }
}

export interface FungibleTokenMetadataProvider {
    ft_metadata() : FungibleTokenMetadata;
}
