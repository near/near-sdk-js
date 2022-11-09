use near_sdk::json_types::Base64VecU8;
use near_sdk::{require};

const FT_METADATA_SPEC: &str = "ft-1.0.0";

class FungibleTokenMetadata {
    spec: String,
    name: String,
    symbol: String,
    icon: Option<String>,
    reference: Option<String>,
    reference_hash: Option<Base64VecU8>,
    decimals: u8,

    assert_valid(&self) {
        require!(this.spec == FT_METADATA_SPEC);
        require!(this.reference.is_some() == this.reference_hash.is_some());
        if let Some(reference_hash) = &this.reference_hash {
            require!(reference_hash.0.len() == 32, "Hash has to be 32 bytes");
        }
    }
}

interface FungibleTokenMetadataProvider {
    ft_metadata(&self) : FungibleTokenMetadata;
}
