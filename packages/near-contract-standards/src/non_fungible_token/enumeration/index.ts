import { AccountId } from "near-sdk-js";
import { Token } from "../token";

/** Offers methods helpful in determining account ownership of NFTs and provides a way to page through NFTs per owner, determine total supply, etc. */
export interface NonFungibleTokenEnumeration {
  /** Returns the total supply of non-fungible tokens as a string per NEP-181 */
  nft_total_supply(): string;

  /** Get a list of all tokens
   *
   * @param from_index - The starting index of tokens to return
   * @param limit - The maximum number of tokens to return
   * @returns - An array of Token objects, as described in Core standard
   */
  nft_tokens({
    from_index,
    limit,
  }: {
    from_index?: number; // default: "0"
    limit?: number; // default: unlimited (could fail due to gas limit)
  }): Token[];

  /** Get number of tokens owned by a given account
   *
   * @param account_id - A valid NEAR account
   * @returns - The number of non-fungible tokens owned by given `account_id` as a string per NEP-181
   */
  nft_supply_for_owner({ account_id }: { account_id: AccountId }): string;

  /** Get list of all tokens owned by a given account
   *
   * @param account_id - A valid NEAR account
   * @param from_index - The starting index of tokens to return
   * @param limit - The maximum number of tokens to return
   * @returns - A paginated list of all tokens owned by this account
   */
  nft_tokens_for_owner({
    account_id,
    from_index,
    limit,
  }: {
    account_id: AccountId;
    from_index?: number; // default: "0"
    limit?: number; // default: unlimited (could fail due to gas limit)
  }): Token[];
}
