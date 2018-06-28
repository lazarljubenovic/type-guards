export type BasicString = 'string' | 'boolean' | 'number' | 'object' | 'function'
export type Primitive = string | boolean | number
export type Basic = Primitive | object | Function

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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Dict = Record<string, any>
export type Predicate = (input: any) => boolean

/**
 * A helper which allows you to utilize the type of validator without using the validator itself.
 *
 * @example
 * ```ts
 * type NumberType = FromGuard<typeof isNumber>
 * ```
 *
 * @example
 * ```ts
 * const isUser = isOfShape({
 *   name: isString,
 *   age: isNumber,
 * })
 * type UserType = FromGuard<typeof isUser>
 * // same as:
 * type UserType2 = { name: string, age: number }
 * ```
 */
export type FromGuard<T> = T extends GuardWithShape<infer V> ? V :
  T extends Guard<infer W> ? W :
    null

export type Guard<T> = (input: any) => input is T
export type GuardWithShape<T> = Guard<T> & { shape: Shape<T> }

export type GuardOrShape<T> = T extends Primitive ? Guard<T> : Shape<T>
export type Shape<T extends Dict> = { [key in keyof T]: GuardOrShape<T[key]> }

export type Unguard<T> = T extends Guard<infer V> ? V : never
export type Unshape<T extends Dict> = { [key in keyof T]: UnshapeOrUnguard<T[key]> }
export type UnshapeOrUnguard<T> = T extends Primitive ? never : T extends Guard<any> ? Unguard<T> : Unshape<T>

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
 * Create a validator that asserts the passed argument is instance of the given constructor.
 */
export function isInstanceOf<T> (ctor: new (...args: any[]) => T) {
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
    resultShape[key] = oneOf(isUndefined, guard.shape[key] as any)
  }
  return isOfShape(resultShape) as any
}
