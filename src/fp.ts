import { Guard, GuardWithKnownInputType, Predicate } from './types'

export function or<A> (a: Guard<A>): Guard<A>
export function or<A, B> (a: Guard<A>, b: Guard<B>): Guard<A | B>
export function or<A, B, C> (a: Guard<A>, b: Guard<B>, c: Guard<C>): Guard<A | B | C>
export function or<A, B, C, D> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>): Guard<A | B | C | D>
export function or (...guards: Predicate[]): Predicate {
  return ((input: any) => guards.some(guard => guard(input)))
}

export function and<A> (a: Guard<A>): Guard<A>
export function and<A, B extends A> (a: Guard<A>, b: GuardWithKnownInputType<A, B>): Guard<A & B>
export function and<A, B> (a: Guard<A>, b: Guard<B>): Guard<A & B>
export function and<A, B extends A, C extends B> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>): Guard<A & B & C>
export function and<A, B extends A, C extends B, D extends C> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>): Guard<A & B & C & D>
export function and<A> (a: Guard<A>, ...predicates: Predicate[]): Guard<A>
export function and (...guards: Predicate[]): Predicate {
  return ((input: any) => guards.every(guard => guard(input)))
}
