'use strict'
/**
 * @author Alethea Rose <alethea@alethearose.com>
 * @copyright Copyright © Alethea Rose, 2017.
 * @license AGPL-3.0
 */

module.exports = class NestedStorage {
  constructor (source) {
    this.store = {}
    if (source && typeof source === 'object') {
      this.merge(source)
    }
  }

  getItem (key) {
    let current = this.store

    for (const subkey of key.split('.')) {
      if (current) {
        current = current[subkey]
      } else {
        break
      }
    }
    return typeof current === 'undefined' ? null : current
  }

  setItem (key, item) {
    let current = this.store
    let subkeys = key.split('.')

    for (let i = 0; i < subkeys.length; i++) {
      let subkey = subkeys[i]
      if (i === subkeys.length - 1) {
        current[subkey] = item
      } else if (typeof current[subkey] !== 'object' || !current[subkey]) {
        current[subkey] = {}
      }
      current = current[subkey]
    }
  }

  removeItem (key) {
    let current = this.store
    let subkeys = key.split('.')
    let path = new Array(subkeys.length - 1)

    for (let i = 0; i < subkeys.length; i++) {
      if (current && typeof current === 'object') {
        path[i] = current
      } else {
        return
      }
      current = current[subkeys[i]]
    }

    delete path.pop()[subkeys.pop()]

    for (let i = path.length - 1; i >= 0; i--) {
      let subkey = subkeys[i]
      if (Object.keys(path[i][subkey]).length === 0) {
        delete path[i][subkey]
      } else {
        break
      }
    }
  }

  clear () {
    this.store = {}
  }

  key (n) {
    return Object.keys(this.flatten()).sort()[n]
  }

  get length () {
    return Object.keys(this.flatten()).length
  }

  merge (object) {
    let currentLevel = Object.keys(object)
      .map(key => { return { key: [key], obj: object[key] } })
    walk(currentLevel, this.setItem.bind(this))
  }

  flatten () {
    const flattened = {}
    walk([{ key: [], obj: this.store }], (key, obj) => {
      flattened[key] = obj
    })
    return flattened
  }
}

function walk (currentLevel, callback) {
  let nextLevel = []

  while (currentLevel.length > 0) {
    currentLevel.forEach(item => {
      if (item.obj && typeof item.obj === 'object') {
        for (let key in item.obj) {
          nextLevel.push({
            key: item.key.concat(key),
            obj: item.obj[key]
          })
        }
      } else {
        callback(item.key.join('.'), item.obj)
      }
    })
    currentLevel = nextLevel
    nextLevel = []
  }
}
