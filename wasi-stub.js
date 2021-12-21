import { edit, add } from "@webassemblyjs/wasm-edit"
import path from 'path'
import fs from 'fs/promises'
import t from '@webassemblyjs/ast'
import { decode } from "@webassemblyjs/wasm-parser";
import { encodeNode } from "@webassemblyjs/wasm-gen"

async function main() {
    let wasm = path.resolve(process.argv[process.argv.length-1])
    let binary = await fs.readFile(wasm)
    let ids = []
    let visitors = {
        ModuleImport(path) {
            let node = path.node
            if (node.module == 'wasi_snapshot_preview1') {
                let funcDef = t.func(t.identifier(node.descr.id, ''), node.descr.signature, [
                    // t.instruction('i32.const', [t.numberLiteralFromRaw(76, '76')]),
                    // t.instruction('return', [])
                ], false, {})
                // console.log(node)
                console.log(node.descr.id)
                console.log(JSON.stringify(funcDef))
                // process.exit(0)
                path.replaceWith(funcDef)
            }
        },
        Func({node}) {
            if (node.signature.params.length > 0 && node.signature.results.length > 0) {
            // if (node.name.value == 'func_54'){
                // console.log(JSON.stringify(node))
                // process.exit()
            }
        }
    }
      
    let newBinary = edit(binary, visitors)
    console.log(decode(newBinary, {}))
    await fs.writeFile(wasm, Buffer.from(newBinary))
}

/*
{
  type: 'ModuleImport',
  module: 'wasi_snapshot_preview1',
  name: 'fd_write',
  descr: {
    type: 'FuncImportDescr',
    id: 'func_59',
    signature: { type: 'Signature', params: [Array], results: [Array] }
  },
  loc: {
    start: { line: -1, column: 2496 },
    end: { line: -1, column: 2530 }
  }
}
{
  type: 'Func',
  name: { type: 'Identifier', value: 'func_60', raw: '' },
  signature: { type: 'Signature', params: [], results: [] },
  body: [
    { type: 'Instr', id: 'nop', args: [], loc: [Object] },
    { type: 'Instr', id: 'end', args: [], loc: [Object] }
  ],
  loc: {
    start: { line: -1, column: 13798 },
    end: { line: -1, column: 13802 }
  },
  metadata: { bodySize: 3 }
}
*/

main()
