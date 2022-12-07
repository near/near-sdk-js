import { assert } from "near-sdk-js";
/** This spec can be treated like a version of the standard. */
export const NFT_METADATA_SPEC = "nft-1.0.0";
/** Metadata for the NFT contract itself. */
export class NFTContractMetadata {
    constructor() {
        this.spec = NFT_METADATA_SPEC;
        this.name = "";
        this.symbol = "";
        this.icon = null;
        this.base_uri = null;
        this.reference = null;
        this.reference_hash = null;
    }
    init(spec, name, symbol, icon, base_uri, reference, reference_hash) {
        this.spec = spec;
        this.name = name;
        this.symbol = symbol;
        this.icon = icon;
        this.base_uri = base_uri;
        this.reference = reference;
        this.reference_hash = reference_hash;
    }
    assert_valid() {
        assert(this.spec == NFT_METADATA_SPEC, "Spec is not NFT metadata");
        assert((this.reference != null) == (this.reference_hash != null), "Reference and reference hash must be present");
        if (this.reference_hash != null) {
            assert(this.reference_hash.length == 32, "Hash has to be 32 bytes");
        }
    }
    static reconstruct(data) {
        const metadata = new NFTContractMetadata();
        Object.assign(metadata, data);
        return metadata;
    }
}
/** Metadata on the individual token level. */
export class TokenMetadata {
    constructor(title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    description, // free-form description
    media, // URL to associated media, preferably to decentralized, content-addressed storage
    media_hash, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    copies, // number of copies of this set of metadata in existence when token was minted.
    issued_at, // ISO 8601 datetime when token was issued or minted
    expires_at, // ISO 8601 datetime when token expires
    starts_at, // ISO 8601 datetime when token starts being valid
    updated_at, // ISO 8601 datetime when token was last updated
    extra, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    reference, // URL to an off-chain JSON file with more info.
    reference_hash // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
    ) {
        this.title = title;
        this.description = description;
        this.media = media;
        this.media_hash = media_hash;
        this.copies = copies;
        this.issued_at = issued_at;
        this.expires_at = expires_at;
        this.starts_at = starts_at;
        this.updated_at = updated_at;
        this.extra = extra;
        this.reference = reference;
        this.reference_hash = reference_hash;
    }
    assert_valid() {
        assert((this.media != null) == (this.media_hash != null), "Media and media hash must be present");
        if (this.media_hash != null) {
            assert(this.media_hash.length == 32, "Media hash has to be 32 bytes");
        }
        assert((this.reference != null) == (this.reference_hash != null), "Reference and reference hash must be present");
        if (this.reference_hash != null) {
            assert(this.reference_hash.length == 32, "Reference hash has to be 32 bytes");
        }
    }
    static reconstruct(data) {
        return new TokenMetadata(data.title, data.description, data.media, data.media_hash, data.copies, data.issued_at, data.expires_at, data.starts_at, data.updated_at, data.extra, data.reference, data.reference_hash);
    }
}
