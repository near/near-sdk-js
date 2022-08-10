import { TokenMetadata } from "./metadata"

export class Token {
    constructor(public token_id: string, public owner_id: string, public metadata: TokenMetadata | null, public approved_account_ids: {[account_id: string]: BigInt}) {}
}