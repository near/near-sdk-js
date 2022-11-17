import { assert, Bytes } from "near-sdk-js";

/** This spec can be treated like a version of the standard. */
export const NFT_METADATA_SPEC = "nft-1.0.0";

/** Metadata for the NFT contract itself. */
export class NFTContractMetadata {
  public spec: string; // required, essentially a version like "nft-1.0.0"
  public name: string; // required, ex. "Mosaics"
  public symbol: string; // required, ex. "MOSIAC"
  public icon?: string; // Data URL
  public base_uri?: string; // Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs
  public reference?: string; // URL to a JSON file with more info
  public reference_hash?: Bytes; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.

  constructor() {
    this.spec = NFT_METADATA_SPEC;
    this.name = "";
    this.symbol = "";
    this.icon = undefined;
    this.base_uri = undefined;
    this.reference = undefined;
    this.reference_hash = undefined;
  }

  init(
    spec: string,
    name: string,
    symbol: string,
    icon?: string,
    base_uri?: string,
    reference?: string,
    reference_hash?: Bytes
  ) {
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
    assert(
      (this.reference !== undefined) == (this.reference_hash !== undefined),
      "Reference and reference hash must be present"
    );
    if (this.reference_hash !== undefined) {
      assert(this.reference_hash.length == 32, "Hash has to be 32 bytes");
    }
  }

  static reconstruct(data: NFTContractMetadata): NFTContractMetadata {
    const metadata = new NFTContractMetadata();
    Object.assign(metadata, data);
    return metadata;
  }
}

/** Metadata on the individual token level. */
export class TokenMetadata {
  constructor(
    public title?: string, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    public description?: string, // free-form description
    public media?: string, // URL to associated media, preferably to decentralized, content-addressed storage
    public media_hash?: Bytes, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    public copies?: bigint, // number of copies of this set of metadata in existence when token was minted.
    public issued_at?: string, // ISO 8601 datetime when token was issued or minted
    public expires_at?: string, // ISO 8601 datetime when token expires
    public starts_at?: string, // ISO 8601 datetime when token starts being valid
    public updated_at?: string, // ISO 8601 datetime when token was last updated
    public extra?: string, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    public reference?: string, // URL to an off-chain JSON file with more info.
    public reference_hash?: Bytes // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  ) {}

  assert_valid() {
    assert(
      (this.media !== undefined) == (this.media_hash !== undefined),
      "Media and media hash must be present"
    );
    if (this.media_hash !== undefined) {
      assert(this.media_hash.length == 32, "Media hash has to be 32 bytes");
    }

    assert(
      (this.reference !== undefined) == (this.reference_hash !== undefined),
      "Reference and reference hash must be present"
    );
    if (this.reference_hash !== undefined) {
      assert(
        this.reference_hash.length == 32,
        "Reference hash has to be 32 bytes"
      );
    }
  }

  static reconstruct(data: TokenMetadata): TokenMetadata {
    return new TokenMetadata(
      data.title,
      data.description,
      data.media,
      data.media_hash,
      data.copies,
      data.issued_at,
      data.expires_at,
      data.starts_at,
      data.updated_at,
      data.extra,
      data.reference,
      data.reference_hash
    );
  }
}

/** Offers details on the contract-level metadata. */
export interface NonFungibleTokenMetadataProvider {
  nft_metadata(): NFTContractMetadata;
}
