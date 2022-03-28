export class NearContract {
    deserialize() {
        let hasRead = env.jsvm_storage_read('STATE', 0)
        if (hasRead != 0) {
            let state = env.read_register(0)
            Object.assign(this, JSON.parse(state))
        } else
            throw new Error('Contract state is empty')
    }

    serialize() {
        env.jsvm_storage_write('STATE', JSON.stringify(this), 0)
    }

    static deserializeArgs() {
        env.jsvm_args(0)
        let args = env.read_register(0)
        return JSON.parse(args || '[]')
    }

    static serializeReturn(ret) {
        return JSON.stringify(ret)
    }
}
