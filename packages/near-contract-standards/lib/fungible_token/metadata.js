import { assert, } from "near-sdk-js";
const FT_METADATA_SPEC = "ft-1.0.0";
export class FungibleTokenMetadata {
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
