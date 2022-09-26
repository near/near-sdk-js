import { near, NearBindgen, call, view, initialize } from 'near-sdk-js'

@NearBindgen({ requireInit: true })
class NBTest {
  status: string

  constructor() {
    this.status = ''
  }

  @initialize({})
  init({ status }: { status: string }): void {
    near.log(`init: ${status}`)
    this.status = status
  }

  @view({})
  getStatus(): string {
    near.log(`getStatus: ${this.status}`)
    return this.status
  }

  @call({})
  setStatus({ status }: { status: string }): void {
    near.log(`setStatus: ${status}`)
    this.status = status
  }
}
