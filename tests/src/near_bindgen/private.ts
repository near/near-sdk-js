import {
    near,
    NearBindgen,
    call,
    view,
} from 'near-sdk-js'

@NearBindgen({})
class PrivateTest {
    value: string;

    constructor() {
        this.value = '';
    }

    @call({ private: true })
    setValueWithPrivateFunction({ value }: { value: string }): void {
        near.log(`setValueWithPrivateFunction: ${value}`)
        this.value = value;
    }

    @call({ private: false })
    setValueWithNotPrivateFunction({ value }: { value: string }): void {
        near.log(`setValueWithNotPrivateFunction: ${value}`)
        this.value = value;
    }

    @call({})
    setValueWithNotPrivateFunctionByDefault({ value }: { value: string }): void {
        near.log(`setValueWithNotPrivateFunctionByDefault: ${value}`)
        this.value = value;
    }

    @view({})
    getValue(): string {
        return this.value;
    }
}
