/** 
 * Creating a new class PostedMessage to keep track of important information
 */

export function get_donation_for_account({ account_id }) {
    let totalAmount = this.donations.get(account_id) || 0;
    return new Donation(account_id, totalAmount)
}