import fs from 'fs/promises'
import path from 'path'

async function main() {
    let source = path.resolve(process.argv[process.argv.length-1])
    let mod = await import(source)
    let exportNames = Object.keys(mod)
    let methods = ''
    for (let name of exportNames) {
        methods += `DEFINE_NEAR_METHOD(${name})\n`
    }
    await fs.writeFile('methods.h', methods)
}

main()