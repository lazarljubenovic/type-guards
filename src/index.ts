import * as fp from './fp'
import { Basic, BasicString, Dict, Guard, GuardWithShape, Omit, Shape, StringToBasic, Unshape, FromGuard } from './types'

export { Guard, GuardWithShape, Dict, Shape, Omit, FromGuard }

export const isOneOf = fp.or
export { fp }

export function is<T> (t: T) {
  return (input: any): input is T => input === t
}

export function isNot<T, N extends T> (not: N) {
  return (input: T): input is Exclude<T, N> => input !== not
}

export function isOfBasicType<T extends BasicString> (basicString: T): Guard<StringToBasic<T>> {
  return ((input: any) => typeof input == basicString) as Guard<StringToBasic<T>>
}

export function isAny(t: unknown): t is any {
  return true
}

export function isUnknown(t: unknown): t is unknown {
  return true
}

export function isNever(t: unknown): t is never {
  return false
}

/**
 * Create a validator that asserts the passed argument is instance of the given constructor.
 */
export function isInstanceOf<T> (ctor: (new (...args: any[]) => T) | (Function & {prototype: T})) {
  return (input => input instanceof ctor) as (x: any) => x is T
}

/**
 * Create a validator that asserts the passed argument is exactly `null`,
 * just like `input === null`.
 */
export const isNull: (arg: any) => arg is null = is(null)

/**
 * Create a validator that asserts the passed argument is exactly `undefined`,
 * just like `input === undefined`.
 */
export const isUndefined: (arg: any) => arg is undefined = is(undefined)

/**
 * Create a validator that asserts the passed argument is either `null` or `undefined`,
 * just like `input == null`.
 */
export const isNullOrUndefined = isOneOf(isNull, isUndefined)

/**
 * Alias for isNullOrUndefined.
 * Just like `input == null`.
 */
export const isNullish = isNullOrUndefined

/**
 * Create a validator that asserts the passed argument is not `null`,
 * just like `input !== null`.
 */
export function isNotNull<T> (arg: T): arg is Exclude<T, null> {
  return arg !== null
}

/**
 * Create a validator that asserts the passed argument is not `undefined`,
 * just like `input !== undefined`.
 */
export function isNotUndefined<T> (arg: T): arg is Exclude<T, undefined> {
  return arg !== undefined
}

/**
 * Create a validator that asserts the passed argument is neither `null` or `undefined`,
 * just like `input != null`.
 * @param arg
 */
export function isNotNullOrUndefined<T> (arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && arg !== undefined
}

/**
 * Alias for isNotNullOrUndefined.
 * Just like `input != null`.
 */
export const isNotNullish = isNotNullOrUndefined

/**
 * Create a validator that asserts the passed argument is of type `'number'`,
 * just like `typeof input == 'number'`.
 */
export const isNumber: (arg: any) => arg is number = isOfBasicType('number')

/**
 * Create a validator that asserts the passed argument is of type `'string'`,
 * just like `typeof input == 'string'`.
 */
export const isString = isOfBasicType('string')

/**
 * Create a validator that asserts the passed argument is of type `'boolean'`,
 * just like `typeof input == 'boolean'`.
 */
export const isBoolean = isOfBasicType('boolean')

/**
 * Create a validator that asserts the passed argument is exactly `true`,
 * just like `input === true`.
 */
export const isTrue: (arg: any) => arg is true = is(true)

/**
 * Create a validator that asserts the passed argument is exactly `false`,
 * just like `input === false`.
 */
export const isFalse: (arg: any) => arg is false = is(false)

/**
 * Create a validator that asserts the passed argument is of type `'symbol'`,
 * just like `typeof input == 'symbol'`.
 */
export const isSymbol = isOfBasicType('symbol')

/**
 * Create a validator that asserts the passed argument is of type `'bigint'`,
 * just like `typeof input == 'bigint'`.
 */
export const isBigint = isOfBasicType('bigint')

/**
 * Create a validator that asserts the passed argument is of type `'function'`,
 * just like `typeof input == 'function'`.
 */
export const isFunction = isOfBasicType('function')

/**
 * Create a validator that asserts the passed argument is of type `'object'`,
 * just like `typeof input == 'object'`.
 *
 * You are probably looking for `isOfShape` which lets you specify what kind of
 * keys and values should the object consist of.
 */
export const isObject = isOfBasicType('object')

/**
 * Create a validator that asserts the passed argument is one of the given values.
 * Usually used for enumerations, but does not require the elements of enumeration
 * to be of the same type.
 *
 * It's a shorter way to say `oneIf(is('a'), is('b'), is('c'))` by saying
 * `isEnum('a', 'b', 'c')`.
 */
export function isEnum<T> (...enums: T[]): Guard<T>
export function isEnum (...enums: Basic[]): (input: any) => boolean
export function isEnum (...enums: Basic[]) {
  return (input: any): boolean => {
    return enums.some(is(input))
  }
}

/**
 * Create a validator that asserts that passed argument is an array. Accepts another
 * type guard which is used for every item of the array.
 */
export function isArrayOf<T extends Dict> (itemGuard: GuardWithShape<T>): GuardWithShape<T[]>
export function isArrayOf<T> (itemGuard: Guard<T>): Guard<T[]>
export function isArrayOf<T> (itemGuard: Guard<T>): Guard<T[]> {
  return ((input: any) => Array.isArray(input) && input.every(itemGuard)) as Guard<T[]>
}

export function isOfExactShape<V extends Dict, T extends Shape<V> = Shape<V>> (shape: T): GuardWithShape<Unshape<T>> {
  return isOfShape<V,T>(shape, true)
}

/**
 * Create a validator that asserts that passed argument is an object of a certain shape.
 * Accepts an object of guards.
 */
export function isOfShape<V extends Dict, T extends Shape<V> = Shape<V>> (shape: T, exact: boolean = false): GuardWithShape<Unshape<T>> {
  const fn: any = (input: any): input is T => {
    if (input === null || typeof input != 'object') return false
    const isNothingMissing = Object.keys(shape).every((key) => {
      const keyGuard: any = (shape as any)[key]
      if (typeof keyGuard == 'function') {
        return key in input && (keyGuard as any)(input[key])
      } else if (typeof keyGuard == 'object') {
        return isOfShape(keyGuard, exact)(input[key])
      }
    })
    if (!isNothingMissing) return false
    return !exact || Object.keys(input).length == Object.keys(shape).length
  }
  fn.shape = shape
  fn.exact = exact
  return fn as GuardWithShape<Unshape<T>>
}

/**
 * Create a validator that asserts that passed argument is a tuple of certain elements.
 */
export function isTuple<A>(a: Guard<A>): Guard<[A]>
export function isTuple<A, B>(a: Guard<A>, b: Guard<B>): Guard<[A, B]>
export function isTuple<A, B, C>(a: Guard<A>, b: Guard<B>, c: Guard<C>): Guard<[A, B, C]>
export function isTuple (...guards: Guard<any>[]): Guard<any> {
  return ((input: any) => {
    if (!Array.isArray(input)) {
      return false
    }

    if (input.length != guards.length) {
      return false
    }

    return input.every((val, i) => guards[i](val))
  }) as Guard<any>
}

/**
 * Create a validator which modifies an existing shape guard. Allows you to pick
 * one or more keys which you want to keep from the object, and discard others.
 *
 * If you want to keep a lot of keys, check out `omit`.
 *
 * @example
 * The following two asserts result in the same guard.
 *
 * ```ts
 * const assert1 = isOfShape({a: isNumber})
 * const assert2 = pick(isOfShape({a: isNumber, b: isString}, 'a')
 * ```
 */
export function pick<T extends Dict, K1 extends keyof T> (guard: GuardWithShape<T>, key1: K1): GuardWithShape<Pick<T, K1>>
export function pick<T extends Dict, K1 extends keyof T, K2 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2): GuardWithShape<Pick<T, K1 | K2>>
export function pick<T extends Dict, K1 extends keyof T, K2 extends keyof T, K3 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2, key3: K3): GuardWithShape<Pick<T, K1 | K2 | K3>>
export function pick<T extends Dict> (guard: GuardWithShape<T>, ...keys: Array<keyof T>): GuardWithShape<Partial<T>> {
  const resultingShape: any = {}
  for (const key of keys) {
    resultingShape[key] = guard.shape[key]
  }
  return isOfShape(resultingShape, guard.exact) as any
}


/**
 * Create a validator which modifies an existing shape guard. Allows you to omit
 * one or more keys which you want to remove form the object, and keep others.
 *
 * If you want to discard a lot of keys, check out `pick`.
 *
 * @example
 * The following two asserts result in the same guard.
 *
 * ```ts
 * const assert1 = isOfShape({a: isNumber})
 * const assert2 = omit(isOfShape({a: isNumber, b: isString}, 'b')
 * ```
 */
export function omit<T extends Dict, K1 extends keyof T> (guard: GuardWithShape<T>, key1: K1): GuardWithShape<Omit<T, K1>>
export function omit<T extends Dict, K1 extends keyof T, K2 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2): GuardWithShape<Omit<T, K1 | K2>>
export function omit<T extends Dict, K1 extends keyof T, K2 extends keyof T, K3 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2, key3: K3): GuardWithShape<Omit<T, K1 | K2 | K3>>
export function omit<T extends Dict> (guard: GuardWithShape<T>, ...keys: Array<keyof T>): GuardWithShape<Partial<T>> {
  const resultingShape: any = {}
  for (const key of Object.keys(guard.shape)) {
    if (keys.indexOf(key) == -1) {
      resultingShape[key] = guard.shape[key]
    }
  }
  return isOfShape(resultingShape, guard.exact) as any
}

/**
 * Allows every value in a shape to be undefined.
 */
export function partial<T extends Dict> (guard: GuardWithShape<T>): GuardWithShape<Partial<T>> {
  const resultShape: any = {}
  for (const key of Object.keys(guard.shape)) {
    resultShape[key] = isOneOf(isUndefined, guard.shape[key] as any)
  }
  return isOfShape(resultShape, guard.exact) as any
}

/**
 * Create a utility function which will throw if the given condition is not satisfied,
 * and which will return the correct type.
 *
 * @param guard
 * @param defaultErrorMessage
 */
export function throwIf<T> (guard: Guard<T>, defaultErrorMessage: string = `Assertion failed.`) {

  return <V>(input: V, additionalErrorMessage?: string): Exclude<V, T> => {
    if (guard(input)) {
      const errorMessage = [defaultErrorMessage, additionalErrorMessage].filter(isNotNullish).join(' ')
      throw new Error(errorMessage)
    }
    return input as Exclude<V, T>

  }

}
