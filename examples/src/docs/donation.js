import { NearContract, NearBindgen, near, call, view, UnorderedSet, UnorderedMap } from 'near-sdk-js'

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

const STORAGE_COST = BigInt('1000000000000000000000');


class Donation {
    constructor(accountId, totalAmount) {
        this.account_id = accountId,
        this.total_amount = totalAmount
    }
  }
@NearBindgen
export class Contract extends NearContract {
    constructor({ beneficiary }) {
        super()
        this.beneficiary = beneficiary;
        this.donations = new UnorderedMap('d');
    }

    @call
    /// Public method: Increment the counter.
    donate() {
        // Get who is calling the method and how much $NEAR they attached
        let donor = near.predecessorAccountId(); 
        let donationAmount = near.attachedDeposit();

        let donatedSoFar = this.donations.get(donor) || 0;
        let toTransfer = donationAmount;

        // This is the user's first donation, lets register it, which increases storage
        if(donatedSoFar == 0) {
            assert(donationAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);
            
            // Subtract the storage cost to the amount to transfer
            toTransfer -= STORAGE_COST
        }

        // Persist in storage the amount donated so far
        donatedSoFar += donationAmount;
        this.donations.insert(donor, donatedSoFar)
        near.log(`Thank you ${donor} for donating ${donationAmount}! You donated a total of ${donatedSoFar}`);

        // Send the money to the beneficiary (TODO)

        // Return the total amount donated so far
        return donatedSoFar
    }

    @call
    // Public - but only callable by near.current_account_id(). Sets the beneficiary
    change_beneficiary({ beneficiary }) {
        assert(near.predecessorAccountId() == near.currentAccountId(), "only owner can change beneficiary");
        this.beneficiary = beneficiary;
    }
}