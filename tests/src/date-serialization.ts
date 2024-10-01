import { near, NearBindgen, call, view } from "near-sdk-js";

/**
 * Simple class used for testing of the `dateField`.
 * - Includes methods:
 *  - `getDateField()` - returns the current `dateField` value.
 *  - `setDateField(args: { dateField })` - used to change the current `dateField` value.
 *  - `getDateFieldAsMilliseconds()` - returns the `dateField` value in milliseconds.
 * @param dateField - Simple `Date` used for testing.
 */
@NearBindgen({})
export class DateSerializationTest {
  dateField: Date;

  constructor() {
    this.dateField = new Date(0);
  }

  @view({})
  getDateField(): Date {
    near.log(`getDateField: ${this.dateField}`);
    return this.dateField;
  }

  @call({})
  setDateField(args: { dateField: Date }): void {
    const dateField = new Date(args.dateField);
    near.log(`setDateField: ${dateField}`);
    this.dateField = dateField;
  }

  @view({})
  getDateFieldAsMilliseconds(): number {
    near.log(`getDateFieldAsMilliseconds: ${this.dateField.getTime()}`);
    return this.dateField.getTime();
  }
}
