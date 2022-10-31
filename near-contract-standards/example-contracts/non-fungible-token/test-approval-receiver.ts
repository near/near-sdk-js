import { initialize, near, NearBindgen, NearPromise, PromiseOrValue, assert, call } from "../../../lib";
import { AccountId } from "../../../lib/types";
import { NonFungibleTokenApprovalReceiver } from "../../src/non_fungible_token/approval/approval_receiver";

const BASE_GAS = 20_000_000_000_000n;
const PROMISE_CALL = 20_000_000_000_000n;
const GAS_FOR_NFT_ON_APPROVE = BASE_GAS + PROMISE_CALL;

interface ValueReturnInterface {
    ok_go(msg: string): PromiseOrValue<string>;
}

@NearBindgen({requireInit: true})
class ApprovalReceiver implements NonFungibleTokenApprovalReceiver, ValueReturnInterface {
    public non_fungible_token_account_id: AccountId;

    constructor() {
        this.non_fungible_token_account_id = '';
    }

    @call({})
    nft_on_approve([token_id, owner_id, approval_id, msg]: [token_id: string, owner_id: string, approval_id: bigint, msg: string]): PromiseOrValue<string> {
        assert(near.predecessorAccountId() === this.non_fungible_token_account_id, 
        "Only supports the one non-fungible token contract"
        );
        
        near.log(`in nft_on_approve; token_id=${token_id}, owner_id=${owner_id}, approval_id=${approval_id}, msg=${msg}`);
        switch(msg) {
            case 'return-now':
                return 'cool';
            default: {
                let prepaid_gas = near.prepaidGas();
                let account_id = near.currentAccountId();
                return NearPromise.new(account_id).functionCall('ok_go', JSON.stringify(msg), 0n, prepaid_gas - GAS_FOR_NFT_ON_APPROVE)
            }
        }
    }

    @call({})
    ok_go(msg: string): PromiseOrValue<string> {
        near.log(`in ok_go, msg=${msg}`);
        return msg;
    }

    @initialize({})
    init(non_fungible_token_account_id: AccountId) {
        this.non_fungible_token_account_id = non_fungible_token_account_id;
    }
}