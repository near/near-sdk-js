import { Option } from "./utils";
/** This spec can be treated like a version of the standard. */
export declare const NFT_METADATA_SPEC = "nft-1.0.0";
/** Metadata for the NFT contract itself. */
export declare class NFTContractMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon: Option<string>;
    base_uri: Option<string>;
    reference: Option<string>;
    reference_hash: Option<string>;
    constructor();
    init(spec: string, name: string, symbol: string, icon: Option<string>, base_uri: Option<string>, reference: Option<string>, reference_hash: Option<string>): void;
    assert_valid(): void;
    static reconstruct(data: NFTContractMetadata): NFTContractMetadata;
}
/** Metadata on the individual token level. */
export declare class TokenMetadata {
    title: Option<string>;
    description: Option<string>;
    media: Option<string>;
    media_hash: Option<string>;
    copies: Option<bigint>;
    issued_at: Option<string>;
    expires_at: Option<string>;
    starts_at: Option<string>;
    updated_at: Option<string>;
    extra: Option<string>;
    reference: Option<string>;
    reference_hash: Option<string>;
    constructor(title: Option<string>, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    description: Option<string>, // free-form description
    media: Option<string>, // URL to associated media, preferably to decentralized, content-addressed storage
    media_hash: Option<string>, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    copies: Option<bigint>, // number of copies of this set of metadata in existence when token was minted.
    issued_at: Option<string>, // ISO 8601 datetime when token was issued or minted
    expires_at: Option<string>, // ISO 8601 datetime when token expires
    starts_at: Option<string>, // ISO 8601 datetime when token starts being valid
    updated_at: Option<string>, // ISO 8601 datetime when token was last updated
    extra: Option<string>, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    reference: Option<string>, // URL to an off-chain JSON file with more info.
    reference_hash: Option<string>);
    assert_valid(): void;
    static reconstruct(data: TokenMetadata): TokenMetadata;
}
/** Offers details on the contract-level metadata. */
export interface NonFungibleTokenMetadataProvider {
    nft_metadata(): NFTContractMetadata;
}
