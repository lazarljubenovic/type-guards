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

export const isNull = is(null)
export const isUndefined = is(undefined)
export const isNullOrUndefined = oneOf(isNull, isUndefined)
export const isNumber = isOfBasicType('number')
export const isString = isOfBasicType('string')
export const isBoolean = isOfBasicType('boolean')
export const isFunction = isOfBasicType('function')
export const isObject = isOfBasicType('object')

export function isArrayOf<T> (itemGuard: Guard<T>): Guard<T[]> {
  return ((input: any) => Array.isArray(input) && input.every(itemGuard)) as Guard<T[]>
}

export type Dict = { [key: string]: any }

export type Shape<T extends Dict> = { [key in keyof T]: T[key] extends Dict ? Shape<T[key]> : Guard<T> }

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

export function isEnum (...enums: Basic[]) {
  return (input: any): boolean => {
    return enums.some(enumConst => enumConst === input)
  }
}
