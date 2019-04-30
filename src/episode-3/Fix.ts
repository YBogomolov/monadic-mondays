// tslint:disable:no-shadowed-variable

import { HKT, Type, URIS } from 'fp-ts/lib/HKT';

export class Fix<F> {
  constructor(public readonly value: HKT<F, Fix<F>>) { }
}

export function fix<F>(value: HKT<F, Fix<F>>): Fix<F> {
  return new Fix(value);
}

export function unfix<F>(term: Fix<F>): HKT<F, Fix<F>> {
  return term.value;
}

export class Cofree<F, A> {
  constructor(readonly attribute: A, readonly hole: HKT<F, Cofree<F, A>>) { }
}

export const cofree = <F, A>(a: A, h: HKT<F, Cofree<F, A>>) => new Cofree(a, h);
export const attribute = <F, A>(c: Cofree<F, A>): A => c.attribute;

export function hole<F extends URIS, A>(c: Cofree<F, A>): Type<F, Cofree<F, A>>;
export function hole<F, A>(c: Cofree<F, A>): HKT<F, Cofree<F, A>> { return c.hole; }

export type Algebra<F, A> = (fa: HKT<F, A>) => A;
export type CVAlgebra<F, A> = (fa: HKT<F, Cofree<F, A>>) => A;
