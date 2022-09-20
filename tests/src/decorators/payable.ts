import { near, NearBindgen, call, view } from "near-sdk-js";

@NearBindgen({})
class PayableTest {
  value: string;

  constructor() {
    this.value = "";
  }

  @call({ payableFunction: true })
  setValueWithPayableFunction({ value }: { value: string }): void {
    near.log(`payableFunction: ${value}`);
    this.value = value;
  }

  @call({ payableFunction: false })
  setValueWithNotPayableFunction({ value }: { value: string }): void {
    near.log(`notPayableFunction: ${value}`);
    this.value = value;
  }

  @call({})
  setValueWithNotPayableFunctionByDefault({ value }: { value: string }): void {
    near.log(`notPayableFunctionDefault: ${value}`);
    this.value = value;
  }

  @view({})
  getValue(): string {
    return this.value;
  }
}
