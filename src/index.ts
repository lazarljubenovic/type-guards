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


export type Dict = { [key: string]: any }
export type Predicate = (input: any) => boolean

export type Shape<T extends Dict> = { [key in keyof T]: T[key] extends Dict ? Shape<T[key]> : Guard<T> }
export type Guard<T> = (input: any) => input is T
export type GuardWithShape<T> = Guard<T> & {shape: Shape<T>}

export function oneOf<A> (a: Guard<A>): Guard<A>
export function oneOf<A, B> (a: Guard<A>, b: Guard<B>): Guard<A | B>
export function oneOf<A, B, C> (a: Guard<A>, b: Guard<B>, c: Guard<C>): Guard<A | B | C>
export function oneOf<A, B, C, D> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>): Guard<A | B | C | D>
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
export const isNullOrUndefined = oneOf(isNull, isUndefined)

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
export function isEnum (...enums: Basic[]) {
  return (input: any): boolean => {
    return enums.some(is(input))
  }
}

/**
 * Create a validator that asserts that passed argument is an array. Accepts another
 * type guard which is used for every item of the array.
 */
export function isArrayOf<T> (itemGuard: Guard<T>): Guard<T[]> {
  return ((input: any) => Array.isArray(input) && input.every(itemGuard)) as Guard<T[]>
}

/**
 * Create a validator that asserts that passed argument is an object of a certain shape.
 * Accepts an object of guards.
 *
 * @param shape
 */
export function isOfShape<T extends Dict> (shape: Shape<T>): GuardWithShape<T> {
  const fn: any = (input: any): input is T => {
    if (typeof input != 'object') return false
    const isNothingMissing = Object.keys(shape).every((key) => {
      const keyGuard = shape[key]
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
  return fn as GuardWithShape<T>
}

export function pick<T extends Dict, K1 extends keyof T> (guard: GuardWithShape<T>, key1: K1): GuardWithShape<Pick<T, K1>>
export function pick<T extends Dict, K1 extends keyof T, K2 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2): GuardWithShape<Pick<T, K1 | K2>>
export function pick<T extends Dict, K1 extends keyof T, K2 extends keyof T, K3 extends keyof T> (guard: GuardWithShape<T>, key1: K1, key2: K2, key3: K3): GuardWithShape<Pick<T, K1 | K2 | K3>>
export function pick<T extends Dict> (guard: GuardWithShape<T>, ...keys: Array<keyof T>): GuardWithShape<Partial<T>> {
  if (guard.shape == null) throw new Error(`The first argument of "pick" must be a shape guard.`)
  const resultingShape: any = {}
  for (const key of keys) {
    resultingShape[key] = guard.shape[key]
  }
  return isOfShape(resultingShape)
}
