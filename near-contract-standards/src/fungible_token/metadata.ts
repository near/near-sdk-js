import {
    require,
    Base64VecU8,
} from "near-sdk-js";

import { Option } from "../non_fungible_token/utils";

const FT_METADATA_SPEC: string = "ft-1.0.0";

export class FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon: Option<string>;
    reference: Option<string>;
    reference_hash: Option<Base64VecU8>;
    decimals: u8;

    assert_valid(&self) {
        require!(this.spec == FT_METADATA_SPEC);
        require!(this.reference.is_some() == this.reference_hash.is_some());
        if let Some(reference_hash) = &this.reference_hash {
            require!(reference_hash.0.len() == 32, "Hash has to be 32 bytes");
        }
    }
}

export interface FungibleTokenMetadataProvider {
    ft_metadata() : FungibleTokenMetadata;
}
