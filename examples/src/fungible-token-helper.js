import { NearBindgen, call, view } from "near-sdk-js";

@NearBindgen({})
export class FungibleTokenHelper {
  constructor() {
    this.data = "";
  }

    @call({})
    ft_on_transfer({ sender_id, amount, msg, receiver_id }) {
        const concatString = `[${amount} from ${sender_id} to ${receiver_id}] ${msg} `;
        this.data = this.data.concat("", concatString);
    }

    @view({})
    get_contract_data() {
        return this.data;
    }
}
