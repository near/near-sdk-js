import fs from 'fs/promises'
import path from 'path'


//TODO: execute it in js env
async function main() {
    let source = path.resolve(process.argv[process.argv.length-2])
    let target = path.resolve(process.argv[process.argv.length-1])
    let code = await fs.readFile(source, 'utf-8')
    let lines = code.split('\n')
    let codes = []
    for (let line of lines) {
        if (line.indexOf('0x') >= 0) {
            let nums = line.trim()
            nums = nums.slice(0, nums.length - 1).split(', ')
            codes.push(nums.map(Number))
        }
    }
    let bytecode = Buffer.concat(codes.map(Buffer.from))
    await fs.writeFile(target, bytecode.toString('base64'))
}

main()