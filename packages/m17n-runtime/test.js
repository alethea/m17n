/* eslint-env mocha */
'use strict'
const expect = require('chai').expect
const M17n = require('.')

describe('M17n', function () {
  let m17n = null
  before(function () {
    m17n = new M17n('en-US', 'USD', plural)
  })

  describe('#t(key, args)', function () {
    context('with numeric catalog', function () {
      before(function () {
        m17n = new M17n('en', 'USD', plural, [
          'x',
          a => `y: ${a.y}`,
          (a, r) => r
        ])
      })

      it('gets a string', function () {
        expect(m17n.t(0)).to.equal('x')
      })

      it('renders a function', function () {
        expect(m17n.t(1, {y: 1})).to.equal('y: 1')
      })

      it('passes in runtime', function () {
        expect(m17n.t(2)).to.equal(m17n)
      })

      it('returns empty string if not found', function () {
        expect(m17n.t(3)).to.equal('')
      })
    })

    context('with nested catalog', function () {
      before(function () {
        m17n = new M17n('en', 'USD', plural, {
          a: {
            x (a) { return `x: ${a.x}` },
            y (a, r) { return r }
          },
          b: 'b'
        })
      })

      it('gets a string', function () {
        expect(m17n.t('b')).to.equal('b')
      })

      it('renders a function', function () {
        expect(m17n.t('a.x', {x: 1})).to.equal('x: 1')
      })

      it('passes in runtime', function () {
        expect(m17n.t('a.y')).to.equal(m17n)
      })

      it('returns empty string if not found', function () {
        expect(m17n.t('a.z.w')).to.equal('')
      })
    })
  })

  describe('#p(count, cases, offset)', function () {
    it('selects a plural value', function () {
      expect(m17n.p(1, {one: 'one', other: 'other'})).to.equal('one')
    })

    it('selects another plural value', function () {
      expect(m17n.p(2, {one: 'one', other: 'other'})).to.equal('other')
    })

    it('selects by exact match', function () {
      expect(m17n.p(0, {0: 'zero', other: 'other'})).to.equal('zero')
    })

    it('falls back to other', function () {
      expect(m17n.p(1, {few: 'few', other: 'other'})).to.equal('other')
    })

    it('selects a different item by offset', function () {
      expect(m17n.p(2, {one: 'one', other: 'other'}, 1)).to.equal('one')
    })

    it('does not apply offset to exact matches', function () {
      expect(m17n.p(2, {2: 'two', other: 'other'}, 1)).to.equal('two')
    })
  })

  describe('#o(count, cases, offset)', function () {
    it('selects an ordinal match', function () {
      expect(m17n.o(2, {two: 'two', other: 'other'})).to.equal('two')
    })

    it('falls back to other', function () {
      expect(m17n.o(2, {one: 'one', other: 'other'})).to.equal('other')
    })

    it('handles an exact match', function () {
      expect(m17n.o(2, {two: 'two', 2: '2', other: 'other'})).to.equal('2')
    })

    it('selects ordinal by offset', function () {
      expect(m17n.o(2, {one: 'one', other: 'other'}, 1)).to.equal('one')
    })
  })

  describe('#s(arg, cases)', function () {
    it('selects a case', function () {
      expect(m17n.s('a', {a: 'a', b: 'b'})).to.equal('a')
    })

    it('falls back to other', function () {
      expect(m17n.s('x', {a: 'a', other: 'other'})).to.equal('other')
    })

    it('returns empty string if no match', function () {
      expect(m17n.s('x', {a: 'a'})).to.equal('')
    })

    it('matches undefined', function () {
      expect(m17n.s(undefined, {'undefined': 'a', other: 'b'}))
        .to.equal('a')
    })
  })

  describe('#d(date, formatIndex)', function () {
    const date = new Date(2017, 0, 2, 3, 4, 5)

    it('formats short date', function () {
      expect(m17n.d(date, 0)).to.equal('1/2/2017')
    })

    it('formats medium date', function () {
      expect(m17n.d(date, 1)).to.equal('Jan 2, 2017')
    })

    it('formats long date', function () {
      expect(m17n.d(date, 2)).to.equal('January 2, 2017')
    })

    it('formats full date', function () {
      expect(m17n.d(date, 3)).to.equal('Monday, January 2, 2017')
    })

    it('formats short time', function () {
      expect(m17n.d(date, 4)).to.equal('3:04 AM')
    })

    it('formats medium time', function () {
      expect(m17n.d(date, 5)).to.equal('3:04:05 AM')
    })

    it('formats long time', function () {
      expect(m17n.d(date, 6)).to.match(/^3:04:05 AM /)
    })

    it('formats full time', function () {
      expect(m17n.d(date, 6)).to.match(/^3:04:05 AM /)
    })

    it('caches formatters', function () {
      m17n = new M17n('en-US', 'USD', plural)
      m17n.d(date, 0)
      expect(m17n.df[0]).to.be.an.instanceof(Intl.DateTimeFormat)
    })
  })

  describe('#n(number, id)', function () {
    it('formats a decimal', function () {
      expect(m17n.n(1000.510)).to.equal('1,000.51')
    })

    it('formats a percentage', function () {
      expect(m17n.n(0.2, 'percent')).to.equal('20%')
    })

    it('formats percent by -2', function () {
      expect(m17n.n(1.12, -2)).to.equal('112%')
    })

    it('formats default currency', function () {
      expect(m17n.n(10.01, 'currency')).to.equal('$10.01')
    })

    it('formants default currency by -1', function () {
      expect(m17n.n(3.45, -1)).to.equal('$3.45')
    })

    it('formats by currency code', function () {
      expect(m17n.n(1.23, 'EUR')).to.equal('€1.23')
    })

    it('formats by padding', function () {
      expect(m17n.n(1, 3)).to.equal('001')
    })

    it('formats only integer portion by padding', function () {
      expect(m17n.n(2.340, 2)).to.equal('02.34')
    })

    it('caches formatters', function () {
      m17n = new M17n('en-US', 'USD', plural)
      m17n.n(1)
      expect(m17n.nf.decimal).to.be.an.instanceof(Intl.NumberFormat)
    })
  })
})

function plural (count, ordinal) {
  if (ordinal) {
    if (count === 1) {
      return 'one'
    } else if (count === 2) {
      return 'two'
    } else if (count === 3) {
      return 'few'
    } else {
      return 'other'
    }
  } else {
    return count === 1 ? 'one' : 'other'
  }
}
