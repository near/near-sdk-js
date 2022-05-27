import * as near from '../api'
import {u8ArrayToString} from '../utils'

const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds"
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?"

/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element
export class Vector {
    constructor(prefix) {
        this.length = 0
        this.prefix = prefix
    }

    len() {
        return this.length
    }

    isEmpty() {
        return this.length == 0
    }

    indexToKey(index) {
        let data = new Uint32Array([index])
        let array = new Uint8Array(data.buffer)
        let key = u8ArrayToString(array)
        return this.prefix + key
    }

    get(index) {
        if (index >= this.length) {
            return null
        }
        let storageKey = this.indexToKey(index)
        return near.jsvmStorageRead(storageKey)
    }

    /// Removes an element from the vector and returns it in serialized form.
    /// The removed element is replaced by the last element of the vector.
    /// Does not preserve ordering, but is `O(1)`.
    swapRemove(index) {
        if (index >= this.length) {
            throw new Error(ERR_INDEX_OUT_OF_BOUNDS)
        } else if (index + 1 == this.length) {
            return this.pop()
        } else {
            let key = this.indexToKey(index)
            let last = this.pop()
            if (near.jsvmStorageWrite(key, last)) {
                return near.storageGetEvicted()
            } else {
                throw new Error(ERR_INCONSISTENT_STATE)
            }
        }
    }

    push(element) {
        let key = this.indexToKey(this.length)
        this.length += 1
        near.jsvmStorageWrite(key, element)
    }

    pop() {
        if (this.isEmpty()) {
            return null
        } else {
            let lastIndex = this.length - 1
            let lastKey = this.indexToKey(lastIndex)
            this.length -= 1
            if (near.jsvmStorageRemove(lastKey)) {
                return near.storageGetEvicted()
            } else {
                throw new Error(ERR_INCONSISTENT_STATE)
            }
        }
    }

    replace(index, element) {
        if (index >= this.length) {
            throw new Error(ERR_INDEX_OUT_OF_BOUNDS)
        } else {
            let key = this.indexToKey(index)
            if (near.jsvmStorageWrite(key, element)) {
                return near.storageGetEvicted()
            } else {
                throw new Error(ERR_INCONSISTENT_STATE)
            }
        }
    }

    extend(elements) {
        for (let element of elements) {
            this.push(element)
        }
    }

    [Symbol.iterator]() {
        return new VectorIterator(this)
    }

    clear() {
        for (let i = 0; i < this.length; i++) {
            let key = this.indexToKey(i)
            near.jsvmStorageRemove(key)
        }
        this.length = 0
    }

    toArray() {
        let ret = []
        for (let v of this) {
            ret.push(v)
        }
        return ret
    }
}

export class VectorIterator {
    constructor(vector) {
        this.current = 0
        this.vector = vector
    }

    next() {
        if (this.current < this.vector.len()) {
            let value = this.vector.get(this.current)
            this.current += 1
            return {value, done: false}
        }
        return {value: null, done: true}
    }
}