export type BasicString = 'string' | 'boolean' | 'number' | 'object' | 'function'
export type Basic = string | boolean | number | object | Function

export type BasicToString<T extends Basic> =
  T extends string ? 'string' :
    T extends number ? 'number' :
      T extends boolean ? 'boolean' :
        T extends Function ? 'function' :
          T extends object ? 'object' :
            never

export type StringToBasic<T extends BasicString> =
  T extends 'string' ? string :
    T extends 'number' ? number :
      T extends 'boolean' ? boolean :
        T extends 'function' ? Function :
          T extends 'object' ? object :
            never

export type Predicate = (input: any) => boolean
export type Guard<T> = (input: any) => input is T

export function oneOf<A> (a: Guard<A>): Guard<A>
export function oneOf<A, B> (a: Guard<A>, b: Guard<B>): Guard<A | B>
export function oneOf<A, B, C> (a: Guard<A>, b: Guard<B>, c: Guard<C>): Guard<A | B | C>
export function oneOf (...guards: Predicate[]): Predicate
export function oneOf (...guards: Predicate[]): Predicate {
  return ((input: any) => guards.some(guard => guard(input)))
}

export function is<T> (t: T) {
  return (input: any): input is T => input === t
}

export function isOfBasicType<T extends BasicString> (basicString: T): Guard<StringToBasic<T>> {
  return ((input: any) => typeof input == basicString) as Guard<StringToBasic<T>>
}

/**
 * Create a validator that asserts the passed argument is exactly `null`,
 * just like `input === null`.
 * @type {(input: any) => input is any}
 */
export const isNull = is(null)

/**
 * Create a validator that asserts the passed argument is exactly `undefined`,
 * just like `input === undefined`.
 * @type {(input: any) => input is any}
 */
export const isUndefined = is(undefined)

/**
 * Create a validator that asserts the passed argument is either `null` or `undefined`,
 * just like `input == null`.
 * @type {Guard<any>}
 */
export const isNullOrUndefined = oneOf(isNull, isUndefined)

/**
 * Create a validator that asserts the passed argument is of type `'number'`,
 * just like `typeof input == 'number'`.
 * @type {Guard<StringToBasic<"number">>}
 */
export const isNumber = isOfBasicType('number')

/**
 * Create a validator that asserts the passed argument is of type `'string'`,
 * just like `typeof input == 'string'`.
 * @type {Guard<StringToBasic<"string">>}
 */
export const isString = isOfBasicType('string')

/**
 * Create a validator that asserts the passed argument is of type `'boolean'`,
 * just like `typeof input == 'boolean'`.
 * @type {Guard<StringToBasic<"boolean">>}
 */
export const isBoolean = isOfBasicType('boolean')

/**
 * Create a validator that asserts the passed argument is of type `'function'`,
 * just like `typeof input == 'function'`.
 *
 * @type {Guard<StringToBasic<"function">>}
 */
export const isFunction = isOfBasicType('function')

/**
 * Create a validator that asserts the passed argument is of type `'object'`,
 * just like `typeof input == 'object'`.
 *
 * You are probably looking for `isOfShape` which lets you specify what kind of
 * keys and values should the object consist of.
 *
 * @type {Guard<StringToBasic<"object">>}
 */
export const isObject = isOfBasicType('object')

/**
 * Create a validator that asserts the passed argument is one of the given values.
 * Usually used for enumerations, but does not require the elements of enumeration
 * to be of the same type.
 *
 * @param enums
 */
export function isEnum (...enums: Basic[]) {
  return (input: any): boolean => {
    return enums.some(enumConst => enumConst === input)
  }
}

/**
 * Create a validator that asserts that passed argument is an array. Accepts another
 * type guard which is used for every item of the array.
 *
 * @param itemGuard
 */
export function isArrayOf<T> (itemGuard: Guard<T>): Guard<T[]> {
  return ((input: any) => Array.isArray(input) && input.every(itemGuard)) as Guard<T[]>
}

export type Dict = { [key: string]: any }

export type Shape<T extends Dict> = { [key in keyof T]: T[key] extends Dict ? Shape<T[key]> : Guard<T> }

/**
 * Create a validator that asserts that passed argument is an object of a certain shape.
 * Accepts an object of guards.
 * @param shape
 */
export function isOfShape<T extends { [key: string]: any }> (shape: Shape<T>): Guard<T> {
  return function (input: any): input is T {
    if (typeof input != 'object') return false
    return Object.keys(shape).every((key) => {
      const keyGuard = shape[key]
      if (typeof keyGuard == 'function') {
        return key in input && (keyGuard as any)(input[key])
      } else if (typeof keyGuard == 'object') {
        return isOfShape(keyGuard)(input[key])
      }
    })
  }
}
