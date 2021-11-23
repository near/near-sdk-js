let source = process.argv[process.argv.length-1]
let mod = require('./'+source)
let exportNames = Object.keys(mod)
methods = ''
for (let name of exportNames) {
    methods += `DEFINE_NEAR_METHOD(${name})\n`
}
const fs = require('fs')
fs.writeFileSync('methods.h', methods)