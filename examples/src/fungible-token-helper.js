import { NearBindgen, call, view } from 'near-sdk-js'

@NearBindgen({})
export class FungibleTokenHelper {
  constructor() {
    this.data = ''
  }

  @call({})
  ftOnTransfer({ senderId, amount, msg, receiverId }) {
    const concatString = `[${amount} from ${senderId} to ${receiverId}] ${msg} `
    this.data = this.data.concat('', concatString)
  }

  @view({})
  getContractData() {
    return this.data
  }
}
