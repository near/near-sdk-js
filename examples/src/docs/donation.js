import { NearContract, NearBindgen, near, call, view, UnorderedSet, UnorderedMap } from 'near-sdk-js'

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}

const STORAGE_COST = BigInt('1_000_000_000_000_000_000_000');

@NearBindgen
class Counter extends NearContract {
    constructor() {
        super({ beneficiary })
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
}

#[near_bindgen]
impl Contract {
  // Public - but only callable by env::current_account_id(). Sets the beneficiary
  #[private]
  pub fn change_beneficiary(&mut self, beneficiary: AccountId) {
    self.beneficiary = beneficiary;
  }
}


#[cfg(test)]
mod tests {
  use super::*;
  use near_sdk::testing_env;
  use near_sdk::test_utils::VMContextBuilder;

  const BENEFICIARY: &str = "beneficiary";
  const NEAR: u128 = 1000000000000000000000000;

  #[test]
  fn initializes() {
      let contract = Contract::new(BENEFICIARY.parse().unwrap());
      assert_eq!(contract.beneficiary, BENEFICIARY.parse().unwrap())
  }

  #[test]
  fn donate() {
      let mut contract = Contract::new(BENEFICIARY.parse().unwrap());

      // Make a donation
      set_context("donor_a", 1*NEAR);
      contract.donate();
      let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(first_donation.total_amount.0, 1*NEAR);

      // Make another donation
      set_context("donor_b", 2*NEAR);
      contract.donate();
      let second_donation = contract.get_donation_for_account("donor_b".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(second_donation.total_amount.0, 2*NEAR);

      // User A makes another donation on top of their original
      set_context("donor_a", 1*NEAR);
      contract.donate();
      let first_donation = contract.get_donation_for_account("donor_a".parse().unwrap());

      // Check the donation was recorded correctly
      assert_eq!(first_donation.total_amount.0, 1*NEAR * 2);

      assert_eq!(contract.total_donations(), 2);
  }

  // Auxiliar fn: create a mock context
  fn set_context(predecessor: &str, amount: Balance) {
    let mut builder = VMContextBuilder::new();
    builder.predecessor_account_id(predecessor.parse().unwrap());
    builder.attached_deposit(amount);

    testing_env!(builder.build());
  }
}