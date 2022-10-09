import test from 'ava';
import { execSync } from 'child_process';


test('should build, constructor is correctly initialized', async (t) => {
    let result = null
    try {
        result = execSync('near-sdk-js build src/constructor-validation/version-1.ts build/constructor-validation/version-1.wasm').toString()
    } catch(e){
        result = e;
  }
  t.not(result.status, 2)
})

test('should throw error, name isnt inited', async (t) => {
    let result = null
    try {
        result = execSync('near-sdk-js build src/constructor-validation/version-2.ts build/constructor-validation/version-2.wasm').toString()
    } catch(e){
        result = e;
  }
 
  t.is(result.status, 2)
})

test('should throw error, construcor is empty', async (t) => {
    let result = null
    try {
        result = execSync('near-sdk-js build src/constructor-validation/version-3.ts build/constructor-validation/version-3.wasm').toString()
    } catch(e){
        result = e;
  }
 
  t.is(result.status, 2)
})

test('should throw error, construcor isnt declared', async (t) => {
    let result = null
    try {
        result = execSync('near-sdk-js build src/constructor-validation/version-4.ts build/constructor-validation/version-4.wasm').toString()
    } catch(e){
        result = e;
  }
 
  t.is(result.status, 2)
})