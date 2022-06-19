const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;

interface Env {
  panic: (msg?: string) => never;
  panic_utf8: (msg: string) => never;
  [x: string]: any;
}
// env object is injected by JSVM
declare let env: Env;

export function log(message: string) {
  env.log(message);
}

export function signerAccountId(): string {
  env.signer_account_id(0);
  return env.read_register(0);
}

export function signerAccountPk(): string {
  env.signer_account_pk(0);
  return env.read_register(0);
}

export function predecessorAccountId(): string {
  env.predecessor_account_id(0);
  return env.read_register(0);
}

export function blockIndex(): BigInt {
  return env.block_index();
}

export function blockHeight(): BigInt {
  return blockIndex();
}

export function blockTimestamp(): BigInt {
  return env.block_timestamp();
}

export function epochHeight(): BigInt {
  return env.epoch_height();
}

export function attachedDeposit(): BigInt {
  return env.attached_deposit();
}

export function prepaidGas(): BigInt {
  return env.prepaid_gas();
}

export function usedGas(): BigInt {
  return env.used_gas();
}

export function randomSeed(): string {
  env.random_seed(0);
  return env.read_register(0);
}

export function sha256(value: string): string {
  env.sha256(value, 0);
  return env.read_register(0);
}

export function keccak256(value: string): string {
  env.keccak256(value, 0);
  return env.read_register(0);
}

export function keccak512(value: string): string {
  env.keccak512(value, 0);
  return env.read_register(0);
}

export function ripemd160(value: string): string {
  env.ripemd160(value, 0);
  return env.read_register(0);
}

export function ecrecover(
  hash: string,
  sig: string,
  v: number,
  malleabilityFlag: number
): string | null {
  let ret = env.ecrecover(hash, sig, v, malleabilityFlag, 0);
  if (ret === 0n) {
    return null;
  }
  return env.read_register(0);
}

export function panic(msg?: string): never {
  if (msg !== undefined) {
    env.panic(msg);
  } else {
    env.panic();
  }
}

export function panicUtf8(msg: string): never {
  env.panic_utf8(msg);
}

export function logUtf8(msg: string) {
  env.log_utf8(msg);
}

export function logUtf16(msg: string) {
  env.log_utf16(msg);
}

export function storageRead(key: any): string | null {
  let ret = env.storage_read(key, 0);
  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}

export function storageHasKey(key: string): boolean {
  let ret = env.storage_has_key(key);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}

export function validatorStake(accountId: string) {
  return env.validator_stake(accountId);
}

export function validatorTotalStake(): BigInt {
  return env.validator_total_stake();
}

export function altBn128G1Multiexp(value: string): string {
  env.alt_bn128_g1_multiexp(value, 0);
  return env.read_register(0);
}

export function altBn128G1Sum(value: string): string {
  env.alt_bn128_g1_sum(value, 0);
  return env.read_register(0);
}

export function altBn128PairingCheck(value: string): boolean {
  let ret = env.alt_bn128_pairing_check(value);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}

export function jsvmAccountId(): string {
  env.jsvm_account_id(0);
  return env.read_register(0);
}

export function jsvmJsContractName(): string {
  env.jsvm_js_contract_name(0);
  return env.read_register(0);
}

export function jsvmMethodName(): string {
  env.jsvm_method_name(0);
  return env.read_register(0);
}

export function jsvmArgs(): string {
  env.jsvm_args(0);
  return env.read_register(0);
}

export function jsvmStorageWrite(key: string, value: string): boolean {
  let exist = env.jsvm_storage_write(key, value, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function jsvmStorageRead(key: string): string | null {
  let exist = env.jsvm_storage_read(key, 0);
  if (exist === 1n) {
    return env.read_register(0);
  }
  return null;
}

export function jsvmStorageRemove(key: string): boolean {
  let exist = env.jsvm_storage_remove(key, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function jsvmStorageHasKey(key: string): boolean {
  let exist = env.jsvm_storage_has_key(key);
  if (exist === 1n) {
    return true;
  }
  return false;
}

export function jsvmCallRaw(
  contractName: string,
  method: string,
  args: any
): string | null {
  env.jsvm_call(contractName, method, JSON.stringify(args), 0);
  return env.read_register(0);
}

export function jsvmCall(
  contractName: string,
  method: string,
  args: any
): string | null {
  let ret = jsvmCallRaw(contractName, method, args);
  if (ret === null) {
    return ret;
  }
  return JSON.parse(ret);
}

export function storageGetEvicted(): string {
  return env.read_register(EVICTED_REGISTER);
}

export function jsvmValueReturn(value: string) {
  env.jsvm_value_return(value);
}
