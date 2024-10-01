import { TokenMetadata } from "./metadata";
import { AccountId } from "near-sdk-js";
/** Note that token IDs for NFTs are strings on NEAR. It's still fine to use auto incrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc. */
export declare type TokenId = string;
/** In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs. */
export declare class Token {
    token_id: TokenId;
    owner_id: AccountId;
    metadata?: TokenMetadata;
    approved_account_ids?: {
        [approved_account_id: AccountId]: bigint;
    };
    constructor(token_id: TokenId, owner_id: AccountId, metadata?: TokenMetadata, approved_account_ids?: {
        [approved_account_id: AccountId]: bigint;
    });
}
