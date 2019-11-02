import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as tg from './index'
import { assert, IsExact } from 'conditional-type-checks'

describe(`fp`, () => {

  describe(`and`, () => {
    it(`works with two arguments`, () => {
      const isPositiveNumber = tg.fp.and(tg.isNumber, n => n > 0)
      expect(isPositiveNumber(1)).to.equal(true) // pass
      expect(isPositiveNumber('1')).to.equal(false) // fail at first
      expect(isPositiveNumber(-1)).to.equal(false) // fail at second
    })
    it(`works with three arguments`, () => {
      const isEvenPositive = tg.fp.and(tg.isNumber, n => n > 0, n => n % 2 == 0)
      expect(isEvenPositive(2)).to.equal(true) // pass
      expect(isEvenPositive('2')).to.equal(false) // fail at first
      expect(isEvenPositive(-2)).to.equal(false) // fail at second
      expect(isEvenPositive(1)).to.equal(false) // fail at third
    })
  })

  describe(`or`, () => {
    describe(`without guards`, () => {
      const isEven = (n: number) => n % 2 == 0
      const isLong = (n: string) => n.length > 10
      const fn = tg.fp.or(isEven, isLong)
      assert<IsExact<typeof fn, (n: number | string) => boolean>>(true)
    })
    describe(`unary`, () => {
      const isEven = (n: number): n is number => n % 2 == 0
      const fn = tg.fp.or(isEven)
      it(`returns true when the only condition is true`, () => {
        expect(fn(2)).to.equal(true)
      })
      it(`returns false when the only condition is false`, () => {
        expect(fn(3)).to.equal(false)
      })
    })
    describe(`binary`, () => {
      const isEven = (n: number): n is number => n % 2 == 0
      const isGeTen = (n: number): n is number => n >= 10
      const fn = tg.fp.or(isEven, isGeTen)
      it(`returns true when both conditions are true`, () => {
        expect(fn(12)).to.equal(true)
      })
      it(`returns true when only one condition is true`, () => {
        expect(fn(2)).to.equal(true)
        expect(fn(11)).to.equal(true)
      })
      it(`returns false when no conditions are true`, () => {
        expect(fn(5)).to.equal(false)
      })
    })
    describe(`tertiary`, () => {
      const isUndefined = (n: any): n is undefined => n === undefined
      const isNull = (n: any): n is null => n === null
      const isFalse = (n: any): n is false => n === false
      const isVeryFalsy = tg.fp.or(isUndefined, isNull, isFalse)
      it(`returns true when one of the conditions is true`, () => {
        expect(isVeryFalsy(null)).to.equal(true)
        expect(isVeryFalsy(undefined)).to.equal(true)
        expect(isVeryFalsy(false)).to.equal(true)
      })
      it(`returns false when none of the conditions are true`, () => {
        expect(isVeryFalsy(0)).to.equal(false)
      })
    })
  })

})
