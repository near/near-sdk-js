import { Bytes } from "near-sdk-js";
import { near, assert } from "near-sdk-js";
import { Option } from "near-sdk-js/lib/utils";

export const NFT_METADATA_SPEC = "nft-1.0.0";

export class NFTContractMetadata {
  constructor(
    public spec: string, // required, essentially a version like "nft-1.0.0"
    public name: string, // required, ex. "Mosaics"
    public symbol: string, // required, ex. "MOSIAC"
    public icon: Option<string>, // Data URL
    public base_uri: Option<string>, // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
    public reference: Option<string>, // URL to a JSON file with more info
    public reference_hash: Option<Bytes> // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  ) {}

  assert_valid() {
    assert(this.spec == NFT_METADATA_SPEC, "Spec is not NFT metadata");
    assert(
      (this.reference != null) == (this.reference_hash != null),
      "Reference and reference hash must be present"
    );
    if (this.reference_hash != null) {
      assert(this.reference_hash.length == 32, "Hash has to be 32 bytes");
    }
  }
}

export class TokenMetadata {
  constructor(
    public title: Option<string>, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    public description: Option<string>, // free-form description
    public media: Option<string>, // URL to associated media, preferably to decentralized, content-addressed storage
    public media_hash: Option<Bytes>, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    public copies: Option<bigint>, // number of copies of this set of metadata in existence when token was minted.
    public issued_at: Option<string>, // ISO 8601 datetime when token was issued or minted
    public expires_at: Option<string>, // ISO 8601 datetime when token expires
    public starts_at: Option<string>, // ISO 8601 datetime when token starts being valid
    public updated_at: Option<string>, // ISO 8601 datetime when token was last updated
    public extra: Option<string>, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    public reference: Option<string>, // URL to an off-chain JSON file with more info.
    public reference_hash: Option<Bytes> // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  ) {}

  assert_valid() {
    assert(
      (this.media != null) == (this.media_hash != null),
      "Media and media hash must be present"
    );
    if (this.media_hash != null) {
      assert(this.media_hash.length == 32, "Media hash has to be 32 bytes");
    }

    assert(
      (this.reference != null) == (this.reference_hash != null),
      "Reference and reference hash must be present"
    );
    if (this.reference_hash != null) {
      assert(
        this.reference_hash.length == 32,
        "Reference hash has to be 32 bytes"
      );
    }
  }
}
