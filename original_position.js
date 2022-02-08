import {SourceMapConsumer} from 'source-map-js'
import {readFileSync} from 'fs'

let f = readFileSync(process.argv[2])
let j = JSON.parse(f)
let s = new SourceMapConsumer(j)
let pos = s.originalPositionFor({line: Number(process.argv[3]), column: 0})
console.log(pos.source)
console.log(pos.line)