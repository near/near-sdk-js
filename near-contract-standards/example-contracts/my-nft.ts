import { NonFungibleToken } from "../src/index";
import { assert, Bytes, call, initialize, near, NearBindgen } from "near-sdk-js/lib/index";
import { NFTContractMetadata, TokenMetadata } from "../src/non_fungible_token/metadata";
import { IntoStorageKey, Option } from "../src/non_fungible_token/utils";
import { AccountId } from "../../lib/types";

class StorageKey {}

class StorageKeyNonFungibleToken extends StorageKey implements IntoStorageKey {
    into_storage_key(): Bytes {
        return 'NFT_';
    }
}

class StorageKeyTokenMetadata extends StorageKey implements IntoStorageKey {
    into_storage_key(): Bytes {
        return 'TOKEN_METADATA_';
    }
}

class StorageKeyTokenEnumeration extends StorageKey implements IntoStorageKey {
    into_storage_key(): Bytes {
        return 'TOKEN_ENUMERATION_';
    }
}

class StorageKeyApproval extends StorageKey implements IntoStorageKey {
    into_storage_key(): Bytes {
        return 'APPROVAL_';
    }
}

@NearBindgen({})
class MyNFT {
    tokens: NonFungibleToken;
    metadata: Option<NFTContractMetadata>;

    constructor() {
    }

    @initialize({requireInit: true})
    init({owner_id, metadata}: {owner_id: string, metadata: NFTContractMetadata}) {
        metadata.assert_valid();
        this.tokens = new NonFungibleToken(
            new StorageKeyNonFungibleToken(),
            owner_id,
            new StorageKeyTokenMetadata(),
            new StorageKeyTokenEnumeration(),
            new StorageKeyApproval()
        )
        this.metadata = metadata;
    }

    @call({payableFunction: true})
    nft_mint({token_id, token_owner_id, token_metadata}: {token_id: AccountId, token_owner_id: AccountId, token_metadata: TokenMetadata}) {
        assert(near.predecessorAccountId() === this.tokens.owner_id, "Unauthorized");
        this.tokens.internal_mint(token_id, token_owner_id, token_metadata);
    }
}
