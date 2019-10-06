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
export const isNullish = isNotNullOrUndefined

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

/**
 * Create a validator that asserts that passed argument is an object of a certain shape.
 * Accepts an object of guards.
 */
export function isOfShape<V extends Dict, T extends Shape<V> = Shape<V>> (shape: T): GuardWithShape<Unshape<T>> {
  const fn: any = (input: any): input is T => {
    if (typeof input != 'object') return false
    const isNothingMissing = Object.keys(shape).every((key) => {
      const keyGuard: any = (shape as any)[key]
      if (typeof keyGuard == 'function') {
        return key in input && (keyGuard as any)(input[key])
      } else if (typeof keyGuard == 'object') {
        return isOfShape(keyGuard)(input[key])
      }
    })
    if (!isNothingMissing) return false
    return Object.keys(input).length == Object.keys(shape).length
  }
  fn.shape = shape
  return fn as GuardWithShape<Unshape<T>>
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
  return isOfShape(resultingShape) as any
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
  return isOfShape(resultingShape) as any
}

/**
 * Allows every value in a shape to be undefined.
 */
export function partial<T extends Dict> (guard: GuardWithShape<T>): GuardWithShape<Partial<T>> {
  const resultShape: any = {}
  for (const key of Object.keys(guard.shape)) {
    resultShape[key] = isOneOf(isUndefined, guard.shape[key] as any)
  }
  return isOfShape(resultShape) as any
}
