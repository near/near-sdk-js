use near_sdk::serde::Serialize;

use crate::*; 

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Donation {
  pub account_id: AccountId, 
  pub total_amount: U128,
}

#[near_bindgen]
impl Contract {
  // Public - get donation by account ID
  pub fn get_donation_for_account(&self, account_id: AccountId) -> Donation {
    Donation {
      account_id: account_id.clone(),
      total_amount: U128(self.donations.get(&account_id).unwrap_or(0))
    }
  }

    // Public - get total number of donations
    pub fn total_donations(&self) -> u64 {
        self.donations.len()
    }

    // Public - paginate through all donations on the contract
    pub fn get_donations(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<Donation> {
        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through donation
        self.donations.keys()
          //skip to the index we specified in the start variable
          .skip(start as usize) 
          //take the first "limit" elements in the vector. If we didn't specify a limit, use 50
          .take(limit.unwrap_or(50) as usize) 
          .map(|account| self.get_donation_for_account(account))
          //since we turned map into an iterator, we need to turn it back into a vector to return
          .collect()
    }

    // Public - beneficiary getter
    pub fn beneficiary(&self) -> AccountId {
        self.beneficiary.clone()
    }
}