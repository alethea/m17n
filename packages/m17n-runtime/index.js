/**
 * @module m17n-runtime
 * @copyright Copyright © Alethea Rose, 2017.
 * @license AGPL-3.0
 */

;(function () {
  'use strict'

  var numeric = 'numeric'
  var shortFormat = 'short'
  var longFormat = 'long'

  var dateTimeFormats = [
    {day: numeric, month: numeric, year: numeric},
    {day: numeric, month: shortFormat, year: numeric},
    {day: numeric, month: longFormat, year: numeric},
    {day: numeric, month: longFormat, year: numeric, weekday: longFormat},
    {hour: numeric, minute: numeric},
    {hour: numeric, minute: numeric, second: numeric},
    {hour: numeric, minute: numeric, second: numeric, timeZoneName: shortFormat},
    {hour: numeric, minute: numeric, second: numeric, timeZoneName: longFormat}
  ]

  function M17n (locale, defaultCurrency, pluralFn, catalog) {
    this.locale = locale
    this.pfn = pluralFn
    this.cur = defaultCurrency
    this.dat = catalog
    this.df = {}
    this.nf = {}
  }

  var prototype = M17n.prototype

  prototype.t = function translate (key, args) {
    var subkeys = []
    var entry = this.dat

    if (typeof key === 'string') {
      subkeys = key.split('.')

      for (var i = 0; i < subkeys.length; i++) {
        entry = entry[subkeys[i]]

        if (!entry) {
          return ''
        }
      }
    } else {
      entry = this.dat[key]
    }

    if (typeof entry === 'string') {
      return entry
    } else if (typeof entry === 'function') {
      return entry(args, this)
    } else {
      return ''
    }
  }

  prototype.p = function plural (count, cases, offset, ordinal) {
    offset = offset || 0
    if (cases[count]) {
      return cases[count]
    } else {
      return this.s(this.pfn(count - offset, ordinal), cases)
    }
  }

  prototype.o = function selectOrdinal (count, cases, offset) {
    return this.p(count, cases, offset, true)
  }

  prototype.s = function select (arg, cases) {
    return cases[String(arg)] || cases.other || ''
  }

  prototype.d = function dateTime (date, formatIndex) {
    var format = this.df[formatIndex]

    if (!format) {
      format = this.df[formatIndex] = new Intl.DateTimeFormat(
        this.locale, dateTimeFormats[formatIndex]
      )
    }

    return format.format(date)
  }

  prototype.n = function number (number, id) {
    var decimal = 'decimal'
    var percent = 'percent'
    var currency = 'currency'
    var NumberFormat = Intl.NumberFormat

    if (!id) {
      id = decimal
    } else if (id === '%') {
      id = percent
    } else if (id === '$') {
      id = currency
    }
    var format = this.nf[id]

    if (!format) {
      if (typeof id === 'number') {
        format = new NumberFormat(this.locale, {
          style: decimal,
          minimumIntegerDigits: id
        })
      } else if (id === decimal || id === percent || id === currency) {
        format = new NumberFormat(this.locale, {
          style: id,
          currency: this.cur
        })
      } else {
        format = new NumberFormat(this.locale, {
          style: currency,
          currency: id
        })
      }
      this.nf[id] = format
    }

    return format.format(number)
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = M17n
  } else if (typeof window === 'object') {
    window.M17n = M17n
  }
}())
