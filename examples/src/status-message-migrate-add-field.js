import {NearBindgen, call, view, near, migrate, Vector, assert} from "near-sdk-js";

class OldStatusMessage {
  constructor() {
    this.records = {};
  }
}

@NearBindgen({})
export class StatusMessage {
  constructor() {
    this.records = {};
    this.new_fields = {};
  }

  @call({})
  set_status({ message }) {
    let account_id = near.signerAccountId();
    near.log(`${account_id} set_status with message ${message}`);
    this.records[account_id] = message;
  }

  @call({})
  set_new_status({ message }) {
    let account_id = near.signerAccountId();
    near.log(`${account_id} set_new_status with message ${message}`);
    this.new_fields[account_id] = message;
  }

  @view({})
  get_status({ account_id }) {
    near.log(`get_status for account_id ${account_id}`);
    return this.records[account_id] || null;
  }

  @view({})
  get_new_status({ account_id }) {
    near.log(`get_new_status for account_id ${account_id}`);
    return this.records[account_id] || null;
  }

  // Migrate from OldStatusMessage to StatusMessage
  @migrate({})
  migrateState() {
    assert(this.records !== undefined, "Contract state should not be deserialized in @migrate");
    // retrieve the current state from the contract
    let records = JSON.parse(near.storageRead("STATE")).records;

    this.records = records;
    this.new_fields = {};
  }
}
