import { NearBindgen, call, view, near } from 'near-sdk-js'

/**
 * Simple contract to test function parameters
 */
@NearBindgen({})
export class FunctionParamsTestContract {
  constructor() {
    this.val1 = 'default1'
    this.val2 = 'default2'
    this.val3 = 'default3'
  }

  @call({})
  set_values({ param1, param2, param3 }) {
    near.log(JSON.stringify({ param1, param2, param3 }))
    this.val1 = param1
    this.val2 = param2
    this.val3 = param3
  }

  @view({})
  get_values() {
    return { val3: this.val3, val2: this.val2, val1: this.val1 }
  }
}
