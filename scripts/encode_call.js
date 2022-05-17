
let contractAccount = process.argv[2]
let methodName = process.argv[3]
let args = process.argv[4]
let input = Buffer.concat([Buffer.from(contractAccount), Buffer.from([0]), Buffer.from(methodName), Buffer.from([0]), Buffer.from(args)])
let encodedArgs = input.toString('base64')
console.log(encodedArgs)

//TODO: delete this file once near-cli is ready