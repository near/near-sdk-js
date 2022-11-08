import { near, NearBindgen, call, view } from "near-sdk-js";

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
