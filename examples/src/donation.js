import { NearContract, NearBindgen, call, view, near, Vector } from 'near-sdk-js'

const STORAGE_COST = 1_000_000_000_000_000_000_000n;

@NearBindgen
class Donation extends NearContract {
  constructor({ beneficiary }) {
    super()
    this.beneficiary = beneficiary
    // Vector can store only primitives so we use 2 vectors instead of list of objects
    this.donors = new Vector('d')
    this.amounts = new Vector('a')
  }

  deserialize() {
    super.deserialize()
    this.donors = Object.assign(new Vector, this.donors)
    this.amounts = Object.assign(new Vector, this.amounts)
  }

  transfer_money(donor, amount) {
    // TODO: implement real transfer once SDK supports it
  }

  @call
  donate() {
    const donor = near.predecessorAccountId()
    const amount = near.attachedDeposit()

    if (amount < STORAGE_COST) {
      throw new Error(`Attach at least ${STORAGE_COST}`)
    }

    this.donors.push(donor)
    this.amounts.push(amount)
    const donation_number = this.donors.len()
    near.log(`Thank you ${donor}! donation number: ${donation_number}`)

    this.transfer_money(donor, amount - STORAGE_COST)

    return donation_number
  }

  @view
  get_donation_by_number({ donation_number }) {
    return { donor: this.donors.get(donation_number), amount: this.amounts.get(donation_number) }
  }

  @view
  total_donations() {
    return this.donors.len()
  }

  @view
  get_donation_list() {
    const donors = this.donors.toArray()
    return donors.map((d, i) => ({ donor: d, amount: this.amounts.get(i) }))
  }

  @view
  get_beneficiary() {
    return this.beneficiary
  }

}
