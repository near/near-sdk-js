import fs from 'fs/promises'
import path from 'path'

// used for deploy code in contract with near.promiseBatchActionDeployContract.
// Usage:
// node wasm_to_bytes.js contract.wasm contract.jsbytes
// copy paste the content of the contract.jsbytes, pass it as arguments to near.promiseBatchActionDeployContract:
// near.promiseBatchActionDeployContract(promsieId, '<content of contract.jsbytes>')
// Note, do not use `bytes()` type check here, which is too expensive for this long bytes and will exceed gas limit.
async function main() {
    let source = path.resolve(process.argv[process.argv.length-2])
    let target = path.resolve(process.argv[process.argv.length-1])
    let code = await fs.readFile(source)
    let result = '';
    for (let e of code) {
        result += '\\x' + e.toString(16).padStart(2, '0')
    }
    await fs.writeFile(target, result)
}

main()