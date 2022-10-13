import { NearBindgen, near, call, view } from "near-sdk-js";
import { initialize, middleware } from "../../lib/near-bindgen";

@NearBindgen({ requireInit: true })
export class Contract {
  @initialize({})
  @middleware((...args) => near.log(`Log from middleware: ${args}`))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init({ randomData: _ }: { randomData: string }) {}

  @call({})
  @middleware((...args) => near.log(`Log from middleware: ${args}`))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  add({ id: _, text: _t }: { id: string; text: string }) {}

  @view({})
  @middleware((...args) => near.log(`Log from middleware: ${args}`))
  get({ id, accountId }: { id: string; accountId: string }): {
    id: string;
    accountId: string;
  } {
    return { id: accountId, accountId: id };
  }

  @view({})
  @middleware(
    (...args) => near.log(`Log from middleware: ${args}`),
    () => near.log("Second log!")
  )
  get_two({ id, accountId }: { id: string; accountId: string }): {
    id: string;
    accountId: string;
  } {
    return { id: accountId, accountId: id };
  }

  @view({})
  get_private(): { id: string; accountId: string } {
    return this.getFromPrivate({ id: "test", accountId: "tset" });
  }

  @middleware((args) => near.log(`Log from middleware: ${args}`))
  getFromPrivate({ id, accountId }: { id: string; accountId: string }): {
    id: string;
    accountId: string;
  } {
    return { id, accountId };
  }
}
