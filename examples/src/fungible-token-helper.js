import { NearBindgen, call, view } from "near-sdk-js";

@NearBindgen({})
class FungibleTokenHelper {
    constructor() {
        super();
        this.data = "";
    }

    @call 
    ftOnTransfer({ senderId, amount, msg, receiverId }) {
        const concatString = `[${amount} from ${senderId} to ${receiverId}] ${msg} `;
        this.data = this.data.concat("", concatString);
    }

    @view 
    getContractData() {
        return this.data;
    }
}