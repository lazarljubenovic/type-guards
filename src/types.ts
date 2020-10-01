export type BasicString = 'string' | 'boolean' | 'number' | 'object' | 'function' | 'symbol'
export type Primitive = string | boolean | number | symbol
export type Basic = Primitive | object | Function

export type BasicToString<T extends Basic> =
  T extends string ? 'string' :
    T extends number ? 'number' :
      T extends boolean ? 'boolean' :
        T extends Function ? 'function' :
          T extends object ? 'object' :
            T extends symbol ? 'symbol' :
              never

export type StringToBasic<T extends BasicString> =
  T extends 'string' ? string :
    T extends 'number' ? number :
      T extends 'boolean' ? boolean :
        T extends 'function' ? Function :
          T extends 'object' ? object :
            T extends 'symbol' ? symbol :
              never

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Dict = Record<string, any>
export type Predicate<Input = any> = (input: Input) => boolean

/**
 * A helper which allows you to utilize the type of validator without using the validator itself.
 *
 * @example
 * type NumberType = FromGuard<typeof isNumber>
 *
 * @example
 * const isUser = isOfShape({
 *   name: isString,
 *   age: isNumber,
 * })
 * type UserType = FromGuard<typeof isUser>
 * // same as:
 * type UserType2 = { name: string, age: number }
 */
export type FromGuard<T> = T extends GuardWithShape<infer V> ? V :
  T extends Guard<infer W> ? W :
    null

export type Guard<T> = (input: any) => input is T
export type GuardWithKnownInputType <I, T extends I> = (input: I) => input is T
export type GuardWithShape<T> = Guard<T> & { shape: Shape<T>, exact: boolean }

export type GuardOrShape<T> = T extends Primitive ? Guard<T> : Shape<T>
export type Shape<T extends Dict> = { [key in keyof T]: GuardOrShape<T[key]> }

export type Unguard<T> = T extends Guard<infer V> ? V : never
export type Unshape<T extends Dict> = { [key in keyof T]: UnshapeOrUnguard<T[key]> }
export type UnshapeOrUnguard<T> = T extends Primitive ? never : T extends Guard<any> ? Unguard<T> : Unshape<T>
