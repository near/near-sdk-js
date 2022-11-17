import { Bytes } from "near-sdk-js";
/** This spec can be treated like a version of the standard. */
export declare const NFT_METADATA_SPEC = "nft-1.0.0";
/** Metadata for the NFT contract itself. */
export declare class NFTContractMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    base_uri?: string;
    reference?: string;
    reference_hash?: Bytes;
    constructor();
    init(spec: string, name: string, symbol: string, icon?: string, base_uri?: string, reference?: string, reference_hash?: Bytes): void;
    assert_valid(): void;
    static reconstruct(data: NFTContractMetadata): NFTContractMetadata;
}
/** Metadata on the individual token level. */
export declare class TokenMetadata {
    title?: string;
    description?: string;
    media?: string;
    media_hash?: Bytes;
    copies?: bigint;
    issued_at?: string;
    expires_at?: string;
    starts_at?: string;
    updated_at?: string;
    extra?: string;
    reference?: string;
    reference_hash?: Bytes;
    constructor(title?: string, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    description?: string, // free-form description
    media?: string, // URL to associated media, preferably to decentralized, content-addressed storage
    media_hash?: Bytes, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    copies?: bigint, // number of copies of this set of metadata in existence when token was minted.
    issued_at?: string, // ISO 8601 datetime when token was issued or minted
    expires_at?: string, // ISO 8601 datetime when token expires
    starts_at?: string, // ISO 8601 datetime when token starts being valid
    updated_at?: string, // ISO 8601 datetime when token was last updated
    extra?: string, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    reference?: string, // URL to an off-chain JSON file with more info.
    reference_hash?: Bytes);
    assert_valid(): void;
    static reconstruct(data: TokenMetadata): TokenMetadata;
}
/** Offers details on the contract-level metadata. */
export interface NonFungibleTokenMetadataProvider {
    nft_metadata(): NFTContractMetadata;
}
