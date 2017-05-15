/* eslint-env mocha */
/* eslint no-unused-expressions: "off" */
'use strict'
const expect = require('chai').expect
const NestedStorage = require('../lib/nested-storage')

describe('NestedStorage', function () {
  describe('#getItem(key)', function () {
    before(function () {
      this.nestedStorage = new NestedStorage({'a.b.c': 1, 'a.z': 2, x: 1})
    })

    it('gets an item', function () {
      expect(this.nestedStorage.getItem('a.b.c')).to.equal(1)
    })

    it('gets a tree from a prefix', function () {
      expect(this.nestedStorage.getItem('a')).to.eql({
        b: {c: 1},
        z: 2
      })
    })

    it('returns null for no match', function () {
      expect(this.nestedStorage.getItem('no')).to.be.null
    })

    it('returns null if out of depth', function () {
      expect(this.nestedStorage.getItem('a.b.c.d')).to.be.null
    })
  })

  describe('#setItem(key, item)', function () {
    beforeEach(function () {
      this.nestedStorage = new NestedStorage()
    })

    it('sets an item', function () {
      this.nestedStorage.setItem('a.b', 1)
      expect(this.nestedStorage.getItem('a.b')).to.equal(1)
    })

    it('nests an item', function () {
      this.nestedStorage.setItem('a.b', 1)
      expect(this.nestedStorage.store).to.eql({a: {b: 1}})
    })

    it('overwrites an item', function () {
      this.nestedStorage.setItem('a', 1)
      this.nestedStorage.setItem('a', 2)
      expect(this.nestedStorage.getItem('a')).to.equal(2)
    })

    it('overwrites a tree', function () {
      this.nestedStorage.setItem('a', 1)
      this.nestedStorage.setItem('a.b', 2)
      expect(this.nestedStorage.getItem('a')).to.eql({b: 2})
    })

    it('merges branches', function () {
      this.nestedStorage.setItem('a.b', 1)
      this.nestedStorage.setItem('a.c', 2)
      expect(this.nestedStorage.getItem('a')).to.eql({b: 1, c: 2})
    })
  })

  describe('#removeItem(key)', function () {
    beforeEach(function () {
      this.nestedStorage = new NestedStorage({'a.b.c': 1, 'a.d': 2})
    })

    it('removes a item', function () {
      this.nestedStorage.removeItem('a.b.c')
      expect(this.nestedStorage.getItem('a.b.c')).to.be.null
    })

    it('prunes empty branches', function () {
      this.nestedStorage.removeItem('a.b.c')
      expect(this.nestedStorage.getItem('a')).to.not.have.keys('b')
    })

    it('leaves other items', function () {
      this.nestedStorage.removeItem('a.b.c')
      expect(this.nestedStorage.getItem('a.d')).to.equal(2)
    })
  })

  describe('#clear()', function () {
    beforeEach(function () {
      this.nestedStorage = new NestedStorage({'a.b.c': 1, 'a.d': 2})
    })

    it('empties the storage', function () {
      this.nestedStorage.clear()
      expect(this.nestedStorage.store).to.be.empty
    })
  })

  describe('#length', function () {
    it('handles 0', function () {
      expect(new NestedStorage().length).to.equal(0)
    })

    it('gets number of keys', function () {
      expect(new NestedStorage({'a.b': 1, x: 2}).length).to.equal(2)
    })
  })

  describe('#key(n)', function () {
    beforeEach(function () {
      this.nestedStorage = new NestedStorage({'a.b.c': 1, 'a.d': 2})
    })

    it('gets a key', function () {
      expect(this.nestedStorage.key(0)).to.equal('a.b.c')
    })
  })

  describe('#flatten()', function () {
    it('returns a flattened object', function () {
      expect(new NestedStorage({a: {b: 1, c: 2}}).flatten())
        .to.eql({'a.b': 1, 'a.c': 2})
    })
  })

  describe('#merge(object)', function () {
    beforeEach(function () {
      this.nestedStorage = new NestedStorage()
    })

    it('unflattens keys', function () {
      this.nestedStorage.merge({'a.b': 1})
      expect(this.nestedStorage.store).to.eql({a: {b: 1}})
    })

    it('unflattens nested keys', function () {
      this.nestedStorage.merge({a: {'b.c': 1}})
      expect(this.nestedStorage.store).to.eql({a: {b: {c: 1}}})
    })

    it('overwrites existing keys', function () {
      this.nestedStorage.setItem('a.b', 1)
      this.nestedStorage.merge({'a.b': 2})
      expect(this.nestedStorage.getItem('a.b')).to.equal(2)
    })
  })
})
