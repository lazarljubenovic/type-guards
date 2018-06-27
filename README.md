# `type-guards`

This module allows you to write run-time validation in a clear way in a strongly-typed manner.
In other words, it gives you a nice way to keep your code DRY by writing the validation function, and get the TypeScript types with it.

## Installation

```text
$ yarn add type-guards
```

## Examples

```ts
import * as tg from 'type-guards'
const isUser = tg.isOfShape({
  name: tg.isString,
  age: tg.isNumber,
})

// we purposly mark it as "any" to immitate API response or user's input
// (anything generated at runtime which we cannot give a static type to)
const john: any = { name: 'John', age: 21 }

if (isUser(john)) {
  john.name // typesafe, this is a string
  jogn.age // typesafe, this is a number
  john.years // error
}
```

## List of functions

### `is`

Create a validator that asserts that the given argument is strictly equal (`===`) to something.
Not very useful on its own.

### `oneOf`

Create a validator that asserts that at least one of the validators passed as arguments are passing.

```ts
const isAbc = oneOf(is('a'), is('b'), is('c'))
isAbc('a') // => true
isAbc('b') // => true
isAbc('c') // => true
isAbc('d') // => false
```

### `isEnum`

Create a validator that asserts that the given arguments is exactly one of the given arguments.
For example, the validator form the previous example can be written in a more simple way.

```ts
const isAbc = isEnum('a', 'b', 'c')
```

### `isNull`

A validator that asserts that the given argument is `null`. Short for `is(null)`

### `isUndefined`

A validator that asserts that the given argument is `undefined`. Short for `is(undefined)`.

### `isNullOrUndefined`

A validator that asserts that the given argument is `null` or `undefined` (like doing `arg == null`).
Short for `oneOf(is(null), is(undefined))`

### `isOfBasicType`

Create a validator that asserts that the given argument is of a certain type.
This is a wrapper around `typeof` checks and works with `string`, `number`, `boolean`, `function` and `object`.

### `isString`, `isNumber`, `isBoolean`, `isObject`, `isFunction`.

Validators that assert that the given argument is of the correct type.
Short for `isOfBasicType('string')`, `isOfBasicType('number')`, etc.

Instead of `isObject`, you probably need `isShapeOf` instead, which gives you more control over the type.

### `isInstanceOf`

Create a validator that asserts that utilized the mechanism of `instanceof` keyword in JavaScript.

### `isArrayOf`

Create a validator that asserts the given argument is an array,
where each of its item is of a certain type.
The type of the items is passed as the argument of `isArrayOf`.

```ts
const areNumbers = isArrayOf(isNumber)
areNumbers([1, 2, 3]) // => true
areNumbers(1) // => false
areNumbers([1, 2, '3']) // => false
areNumbers([1, 2, undefined]) // => false
``` 

Of course, feel free to combine validators.

```ts
const areKindaNumbers = isArrayOf(oneOf(isNumber, isNullOrUndefined))
areNumbers([1, 2, 3]) // => true
areNumbers([1, 2, null, 4, undefined]) // => true
```

### `isOfShape`

Create a validator that asserts that the given argument is an object,
where each of the values of its keys correspond to the given shape.
The shape is an object where the values are either new shapes or simple type checks.

```ts
const isUser = isOfShape({ name: isString, age: isNumber })
isUser({name: 'John', age: 21}) // => true
isUser({name: 'John', years: 21}) // => false
isUser({name: 'John'}) // => false

const isCompany = isOfShape({
  name: isString,
  users: isArrayOf(isUser),
})
isCompany({name: 'Untitled', users: [{name: 'John', age: 21}]) // => true
```

### `pick`

Create a validator which utilizes an already created validator and picks only a part of it.

```ts
const fullUser = isOfShape({ name: isString, age: isNumber })
const partOfUser1 = pick(fullUser, 'name')
const partOfUser2 = isOfShape({ name: isString })
// the two consts above produce the same validator
```

### `omit`

Create a validator which utilizes an already created validator and omits a part of it.

```ts
const fullUser = isOfShape({ name: isString, age: isNumber })
const partOfUser1 = omit(fullUser, 'age')
const partOfUser2 = isOfShape({ name: isString })
// the two consts above produce the same validator
```

### `partial`

Create a validator which utilizes an already created validator but allows `undefined` for every value.

```ts
const fullUser = isOfShape({ name: isString, age: isNumber })
const partOfUser1 = partial(fullUser)
const partOfUser2 = isOfShape({ name: one(isUndefined, isString), age: oneOf(isUndefined, isNumber) })
// the two consts above produce the same validator
```

Note, however:

```ts
const partOfUser = partial(fullUser)
partOfUser({ name: 'John', age: 21 }) // => true
partOfUser({ name: 'John' }) // => false (missing "age")
partOfUser({ name: 'John', age: undefined }) => true 
```

Currently working on making the second one return `true` as well.

## Using the type only

If you do not need to use the validator, but only want the type information, you can do that as well.

```ts
type Number = FromGuard<typeof isNumber> // : number

const isUser = isOfShape({ name: isString, age: isNumber })
type User = FromGuard<typeof isUser> // : { name: string, age: number }
```

This means that your codebase can have validators "just in case", but if you never use them, it will not increase your bundle size.
You could also set up your build pipeline in such way that the validators are run only in development mode.
