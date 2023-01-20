import { Guard, GuardWithKnownInputType, Predicate } from './types'

export function or<A> (a: Guard<A>): Guard<A>
export function or<A, B> (a: Guard<A>, b: Guard<B>): Guard<A | B>
export function or<A, B, C> (a: Guard<A>, b: Guard<B>, c: Guard<C>): Guard<A | B | C>
export function or<A, B, C, D> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>): Guard<A | B | C | D>
export function or<A, B, C, D, E> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>): Guard<A | B | C | D| E>
export function or<A, B, C, D, E, F> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>, f: Guard<F>): Guard<A | B | C | D| E | F>
export function or<A, B, C, D, E, F, G> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>, f: Guard<F>, g: Guard<G>): Guard<A | B | C | D| E | F | G>
export function or<A, B, C, D, E, F, G, H> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>, f: Guard<F>, g: Guard<G>, h: Guard<H>): Guard<A | B | C | D| E | F | G | H>
export function or<A, B, C, D, E, F, G, H, I> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>, f: Guard<F>, g: Guard<G>, h: Guard<H>, i: Guard<I>): Guard<A | B | C | D| E | F | G | H | I>
export function or<A, B, C, D, E, F, G, H, I, J> (a: Guard<A>, b: Guard<B>, c: Guard<C>, d: Guard<D>, e: Guard<E>, f: Guard<F>, g: Guard<G>, h: Guard<H>, i: Guard<I>, j: Guard<J>): Guard<A | B | C | D| E | F | G | H | I | J>
export function or<T> (...guards: Predicate<T>[]): Predicate<T>
export function or (...guards: Predicate[]): Predicate
export function or (...predicates: Predicate[]): Predicate {
  return ((input: any) => predicates.some(guard => guard(input)))
}

export function and<A> (a: Guard<A>): Guard<A>
export function and<A, B extends A> (a: Guard<A>, b: GuardWithKnownInputType<A, B>): Guard<A & B>
export function and<A, B> (a: Guard<A>, b: Guard<B>): Guard<A & B>
export function and<A, B extends A, C extends B> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>): Guard<A & B & C>
export function and<A, B extends A, C extends B, D extends C> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>): Guard<A & B & C & D>
export function and<A, B extends A, C extends B, D extends C, E extends D> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>): Guard<A & B & C & D & E>
export function and<A, B extends A, C extends B, D extends C, E extends D, F extends E> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>, f: GuardWithKnownInputType<A & B & C & D & E, F>): Guard<A & B & C & D & E & F>
export function and<A, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>, f: GuardWithKnownInputType<A & B & C & D & E, F>, g: GuardWithKnownInputType<A & B & C & D & E & F, G>): Guard<A & B & C & D & E & F & G>
export function and<A, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>, f: GuardWithKnownInputType<A & B & C & D & E, F>, g: GuardWithKnownInputType<A & B & C & D & E & F, G>, h: GuardWithKnownInputType<A & B & C & D & E & F & G, H>): Guard<A & B & C & D & E & F & G & H>
export function and<A, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G, I extends H> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>, f: GuardWithKnownInputType<A & B & C & D & E, F>, g: GuardWithKnownInputType<A & B & C & D & E & F, G>, h: GuardWithKnownInputType<A & B & C & D & E & F & G, H>, i: GuardWithKnownInputType<A & B & C & D & E & F & G & H, I>): Guard<A & B & C & D & E & F & G & H & I>
export function and<A, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G, I extends H, J extends I> (a: Guard<A>, b: GuardWithKnownInputType<A, B>, c: GuardWithKnownInputType<A & B, C>, d: GuardWithKnownInputType<A & B & C, D>, e: GuardWithKnownInputType<A & B & C & D, E>, f: GuardWithKnownInputType<A & B & C & D & E, F>, g: GuardWithKnownInputType<A & B & C & D & E & F, G>, h: GuardWithKnownInputType<A & B & C & D & E & F & G, H>, i: GuardWithKnownInputType<A & B & C & D & E & F & G & H, I>, j: GuardWithKnownInputType<A & B & C & D & E & F & G & H & I, J>): Guard<A & B & C & D & E & F & G & H & I & J>
export function and<A> (a: Guard<A>, ...predicates: Predicate[]): Guard<A>
export function and (...predicates: Predicate[]): Predicate {
  return ((input: any) => predicates.every(guard => guard(input)))
}
