function call(target, name, descriptor) {
  return descriptor;
}
function view(target, name, descriptor) {
  return descriptor;
}
function NearBindgen(Class) {
  let OriginalClass = Class;

  let NewClass = function () {
    let args = OriginalClass.deserializeArgs();
    let ret = new OriginalClass(...args);
    ret.serialize();
    return ret;
  };

  NewClass.prototype = OriginalClass.prototype;

  NewClass._get = function () {
    let ret = Object.create(NewClass.prototype);
    return ret;
  };

  return NewClass;
}

class NearContract {
  deserialize() {
    let hasRead = env.jsvm_storage_read('STATE', 0);

    if (hasRead != 0) {
      let state = env.read_register(0);
      Object.assign(this, JSON.parse(state));
    } else throw new Error('Contract state is empty');
  }

  serialize() {
    env.jsvm_storage_write('STATE', JSON.stringify(this), 0);
  }

  static deserializeArgs() {
    env.jsvm_args(0);
    let args = env.read_register(0);
    return JSON.parse(args || '[]');
  }

  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }

}

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
function signerAccountId() {
  env.signer_account_id(0);
  return env.read_register(0);
}
function signerAccountPk() {
  env.signer_account_pk(0);
  return env.read_register(0);
}
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return env.read_register(0);
}
function randomSeed() {
  env.random_seed(0);
  return env.read_register(0);
}
function sha256(value) {
  env.sha256(value, 0);
  return env.read_register(0);
}
function keccak256(value) {
  env.keccak256(value, 0);
  return env.read_register(0);
}
function keccak512(value) {
  env.keccak512(value, 0);
  return env.read_register(0);
}
function ripemd160(value) {
  env.ripemd160(value, 0);
  return env.read_register(0);
}
function ecrecover(hash, sign, v, malleabilityFlag) {
  let ret = env.ecrecover(hash, sign, v, malleabilityFlag, 0);

  if (ret === 0n) {
    return null;
  }

  return env.read_register(0);
} // TODO: env.promise_result returns need additioonal handling

function storageRead(key) {
  let ret = env.storage_read(key, 0);

  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}
function altBn128G1Multiexp(value) {
  env.alt_bn128_g1_multiexp(value, 0);
  return env.read_register(0);
}
function altBn128G1Sum(value) {
  env.alt_bn128_g1_sum(value, 0);
  return env.read_register(0);
}
function jsvmAccountId() {
  env.jsvm_account_id(0);
  return env.read_register(0);
}
function jsvmJsContractName() {
  env.jsvm_js_contract_name(0);
  return env.read_register(0);
}
function jsvmMethodName() {
  env.jsvm_method_name(0);
  return env.read_register(0);
}
function jsvmArgs() {
  env.jsvm_args(0);
  return env.read_register(0);
}
function jsvmStorageWrite(key, value) {
  let exist = env.jsvm_storage_write(key, value, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}
function jsvmStorageRead(key) {
  let exist = env.jsvm_storage_read(key, 0);

  if (exist === 1n) {
    return env.read_register(0);
  }

  return null;
}
function jsvmStorageRemove(key) {
  let exist = env.jsvm_storage_remove(key, EVICTED_REGISTER);

  if (exist === 1n) {
    return true;
  }

  return false;
}
function jsvmStorageHasKey(key) {
  let exist = env.jsvm_storage_has_key(key);

  if (exist === 1n) {
    return true;
  }

  return false;
}
function jsvmCall(contractName, method, args) {
  env.jsvm_call(contractName, method, JSON.stringify(args), 0);
  return JSON.parse(env.read_register(0) || 'null');
}
function storageGetEvicted() {
  return env.read_register(EVICTED_REGISTER);
}

var api = /*#__PURE__*/Object.freeze({
    __proto__: null,
    signerAccountId: signerAccountId,
    signerAccountPk: signerAccountPk,
    predecessorAccountId: predecessorAccountId,
    randomSeed: randomSeed,
    sha256: sha256,
    keccak256: keccak256,
    keccak512: keccak512,
    ripemd160: ripemd160,
    ecrecover: ecrecover,
    storageRead: storageRead,
    altBn128G1Multiexp: altBn128G1Multiexp,
    altBn128G1Sum: altBn128G1Sum,
    jsvmAccountId: jsvmAccountId,
    jsvmJsContractName: jsvmJsContractName,
    jsvmMethodName: jsvmMethodName,
    jsvmArgs: jsvmArgs,
    jsvmStorageWrite: jsvmStorageWrite,
    jsvmStorageRead: jsvmStorageRead,
    jsvmStorageRemove: jsvmStorageRemove,
    jsvmStorageHasKey: jsvmStorageHasKey,
    jsvmCall: jsvmCall,
    storageGetEvicted: storageGetEvicted
});

class LookupMap {
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }

  containsKey(key) {
    let storageKey = this.keyPrefix + key;
    return jsvmStorageHasKey(storageKey);
  }

  get(key) {
    let storageKey = this.keyPrefix + key;
    return jsvmStorageRead(storageKey);
  }

  remove(key) {
    let storageKey = this.keyPrefix + key;

    if (jsvmStorageRemove(storageKey)) {
      return storageGetEvicted();
    }

    return null;
  }

  set(key, value) {
    let storageKey = this.keyPrefix + key;

    if (jsvmStorageWrite(storageKey, value)) {
      return storageGetEvicted();
    }

    return null;
  }

  extend(kvs) {
    for (let kv of kvs) {
      this.set(kv[0], kv[1]);
    }
  }

}

function u8ArrayToString(array) {
  let ret = '';

  for (let e of array) {
    ret += String.fromCharCode(e);
  }

  return ret;
}
function stringToU8Array(string) {
  let ret = new Uint8Array(string.length);

  for (let i in string) {
    ret[i] = string.charCodeAt(i);
  }

  return ret;
}

const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
const ERR_INCONSISTENT_STATE$1 = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?"; /// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element

class Vector {
  constructor(prefix) {
    this.length = 0;
    this.prefix = prefix;
  }

  len() {
    return this.length;
  }

  isEmpty() {
    return this.length == 0;
  }

  indexToKey(index) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    let key = u8ArrayToString(array);
    return this.prefix + key;
  }

  get(index) {
    if (index >= this.length) {
      return null;
    }

    let storageKey = this.indexToKey(index);
    return jsvmStorageRead(storageKey);
  } /// Removes an element from the vector and returns it in serialized form.
  /// The removed element is replaced by the last element of the vector.
  /// Does not preserve ordering, but is `O(1)`.


  swapRemove(index) {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else if (index + 1 == this.length) {
      return this.pop();
    } else {
      let key = this.indexToKey(index);
      let last = this.pop();

      if (jsvmStorageWrite(key, last)) {
        return storageGetEvicted();
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$1);
      }
    }
  }

  push(element) {
    let key = this.indexToKey(this.length);
    this.length += 1;
    jsvmStorageWrite(key, element);
  }

  pop() {
    if (this.isEmpty()) {
      return null;
    } else {
      let lastIndex = this.length - 1;
      let lastKey = this.indexToKey(lastIndex);
      this.length -= 1;

      if (jsvmStorageRemove(lastKey)) {
        return storageGetEvicted();
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$1);
      }
    }
  }

  replace(index, element) {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else {
      let key = this.indexToKey(index);

      if (jsvmStorageWrite(key, element)) {
        return storageGetEvicted();
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$1);
      }
    }
  }

  extend(elements) {
    for (let element of elements) {
      this.push(element);
    }
  }

  [Symbol.iterator]() {
    return new VectorIterator(this);
  }

  clear() {
    for (let i = 0; i < this.length; i++) {
      let key = this.indexToKey(i);
      jsvmStorageRemove(key);
    }

    this.length = 0;
  }

  toArray() {
    let ret = [];

    for (let v of this) {
      ret.push(v);
    }

    return ret;
  }

}
class VectorIterator {
  constructor(vector) {
    this.current = 0;
    this.vector = vector;
  }

  next() {
    if (this.current < this.vector.len()) {
      let value = this.vector.get(this.current);
      this.current += 1;
      return {
        value,
        done: false
      };
    }

    return {
      value: null,
      done: true
    };
  }

}

class LookupSet {
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }

  contains(key) {
    let storageKey = this.keyPrefix + key;
    return jsvmStorageHasKey(storageKey);
  }

  remove(key) {
    let storageKey = this.keyPrefix + key;

    if (jsvmStorageRemove(storageKey)) {
      return storageGetEvicted();
    }

    return null;
  }

  set(key) {
    let storageKey = this.keyPrefix + key;

    if (jsvmStorageWrite(storageKey, '')) {
      return storageGetEvicted();
    }

    return null;
  }

  extend(kvs) {
    for (let kv of kvs) {
      this.set(kv[0]);
    }
  }

}

const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
class UnorderedMap {
  constructor(prefix) {
    this.length = 0;
    this.keyIndexPrefix = prefix + 'i';
    let indexKey = prefix + 'k';
    let indexValue = prefix + 'v';
    this.keys = new Vector(indexKey);
    this.values = new Vector(indexValue);
  }

  len() {
    let keysLen = this.keys.len();
    let valuesLen = this.values.len();

    if (keysLen != valuesLen) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }

    return keysLen;
  }

  isEmpty() {
    let keysIsEmpty = this.keys.isEmpty();
    let valuesIsEmpty = this.values.isEmpty();

    if (keysIsEmpty != valuesIsEmpty) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }

    return keysIsEmpty;
  }

  serializeIndex(index) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToString(array);
  }

  deserializeIndex(rawIndex) {
    let array = stringToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }

  getIndexRaw(key) {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = jsvmStorageRead(indexLookup);
    return indexRaw;
  }

  get(key) {
    let indexRaw = this.getIndexRaw(key);

    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      let value = this.values.get(index);

      if (value) {
        return value;
      } else {
        throw new Error(ERR_INCONSISTENT_STATE);
      }
    }

    return null;
  }

  set(key, value) {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = jsvmStorageRead(indexLookup);

    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      return this.values.replace(index, value);
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      jsvmStorageWrite(indexLookup, nextIndexRaw);
      this.keys.push(key);
      this.values.push(value);
      return null;
    }
  }

  remove(key) {
    let indexLookup = this.keyIndexPrefix + key;
    let indexRaw = jsvmStorageRead(indexLookup);

    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        jsvmStorageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.                
        let lastKeyRaw = this.keys.get(this.len() - 1);

        if (!lastKeyRaw) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }

        jsvmStorageRemove(indexLookup); // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.

        if (lastKeyRaw != key) {
          let lastLookupKey = this.keyIndexPrefix + lastKeyRaw;
          jsvmStorageWrite(lastLookupKey, indexRaw);
        }
      }

      let index = this.deserializeIndex(indexRaw);
      this.keys.swapRemove(index);
      return this.values.swapRemove(index);
    }

    return null;
  }

  clear() {
    for (let key of this.keys) {
      let indexLookup = this.keyIndexPrefix + key;
      jsvmStorageRemove(indexLookup);
    }

    this.keys.clear();
    this.values.clear();
  }

  toArray() {
    let ret = [];

    for (let v of this) {
      ret.push(v);
    }

    return ret;
  }

  [Symbol.iterator]() {
    return new UnorderedMapIterator(this);
  }

  extend(kvs) {
    for (let [k, v] of kvs) {
      this.set(k, v);
    }
  }

}

class UnorderedMapIterator {
  constructor(unorderedMap) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.values = new VectorIterator(unorderedMap.values);
  }

  next() {
    let key = this.keys.next();
    let value = this.values.next();

    if (key.done != value.done) {
      throw new Error(ERR_INCONSISTENT_STATE);
    }

    return {
      value: [key.value, value.value],
      done: key.done
    };
  }

}

export { LookupMap, LookupSet, NearBindgen, NearContract, UnorderedMap, Vector, call, api as near, view };
//# sourceMappingURL=contract.js.map
