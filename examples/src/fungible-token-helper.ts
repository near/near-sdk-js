import { NearBindgen, call, view } from "near-sdk-js";

@NearBindgen({})
class _FungibleTokenHelper {
    data = "";

    @call({})
    ft_on_transfer({ sender_id, amount, msg, receiver_id }: { sender_id: string, amount: string, msg: string, receiver_id: string }) {
        const concatString = `[${amount} from ${sender_id} to ${receiver_id}] ${msg} `;
        this.data = this.data.concat("", concatString);
    }

    @view({})
    get_contract_data() {
        return this.data;
    }
}