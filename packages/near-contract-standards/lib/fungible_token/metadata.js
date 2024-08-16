import { assert, } from "near-sdk-js";
const FT_METADATA_SPEC = "ft-1.0.0";

/**
 * Return metadata for the token, up to contract to implement.
 */
export class FungibleTokenMetadata {
    constructor(spec, name, symbol, icon, referance, referance_hash, decimals) {
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
        const isReferenceProvided = this.reference ? true : false;
        const isReferenceHashProvided = this.reference_hash ? true : false;
        assert(isReferenceHashProvided === isReferenceProvided, "reference and reference_hash must be either both provided or not");
        if (this.reference_hash) {
            assert(this.reference_hash.length === 32, "reference_hash must be 32 bytes");
        }
    }
}
