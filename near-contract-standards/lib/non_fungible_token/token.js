/** In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs. */
export class Token {
    constructor(token_id, owner_id, metadata, approved_account_ids) {
        this.token_id = token_id;
        this.owner_id = owner_id;
        this.metadata = metadata;
        this.approved_account_ids = approved_account_ids;
    }
}
