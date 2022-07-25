import {near, utils} from 'near-sdk-js'

export const NFT_METADATA_SPEC = "nft-1.0.0";

export class NFTContractMetadata {
    constructor({spec, name, symbol, icon, base_uri, reference, reference_hash}) {
        this.spec = spec  // required, essentially a version like "nft-1.0.0"
        this.name = name  // required, ex. "Mosaics"
        this.symbol = symbol // required, ex. "MOSIAC"
        this.icon = icon // Data URL
        this.base_uri = base_uri // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
        this.reference = reference // URL to a JSON file with more info
        this.reference_uri = reference_uri // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
    }

    assert_valid() {
        utils.assert(self.spec == NFT_METADATA_SPEC, "Spec is not NFT metadata");
        utils.assert(
            (self.reference != null) == (self.reference_hash != null),
            "Reference and reference hash must be present"
        );
        if (this.reference_hash != null) {
            utils.assert(this.reference_hash.length == 32, "Hash has to be 32 bytes");
        }
    }
}


export class TokenMetadata {
    constructor({title, description, media, media_hash, copies, issued_at, expires_at, starts_at, updated_at, extra, reference, reference_hash}) {
        this.title = title // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
        this.description = description // free-form description
        this.media = media // URL to associated media, preferably to decentralized, content-addressed storage
        this.media_hash = media_hash // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
        this.copies = copies // number of copies of this set of metadata in existence when token was minted.
        this.issued_at = issued_at // ISO 8601 datetime when token was issued or minted
        this.expires_at = expires_at // ISO 8601 datetime when token expires
        this.starts_at = starts_at // ISO 8601 datetime when token starts being valid
        this.updated_at = updated_at // ISO 8601 datetime when token was last updated
        this.extra = extra // anything extra the NFT wants to store on-chain. Can be stringified JSON.
        this.reference = reference // URL to an off-chain JSON file with more info.
        this.reference_hash = reference_hash // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
    }

    assert_valid() {        
        utils.assert((this.media != null) == (this.media_hash != null));
        if (this.media_hash != null) {
            utils.assert(this.media_hash.length == 32, "Media hash has to be 32 bytes");
        }

        utils.assert((this.reference != null) == (this.reference_hash != null));
        if (this.reference_hash != null) {
            utils.assert(this.reference_hash.length == 32, "Reference hash has to be 32 bytes");
        }
    }
}