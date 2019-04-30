// tslint:disable:no-any

import { Functor1 } from 'fp-ts/lib/Functor';

import { Fix, fix } from './Fix';

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Nat: NatF<A>;
  }
}

export const URI = 'Nat';
export type URI = typeof URI;

export class Zero<A> {
  static value = new Zero<any>();
  public value: never;
  readonly _tag: 'Zero' = 'Zero';
  readonly '_A': A;
  readonly '_URI': URI;
  private constructor() { }
  map<B>(_f: (a: A) => B): NatF<B> {
    return this as any;
  }
}

export class Succ<A> {
  readonly _tag: 'Succ' = 'Succ';
  readonly '_A': A;
  readonly '_URI': URI;
  constructor(public value: A) { }
  map<B>(f: (a: A) => B): NatF<B> {
    return new Succ(f(this.value));
  }
}

export type NatF<A> = Zero<A> | Succ<A>;
export type Nat = Fix<URI>;

export const zero = fix(Zero.value);
export const succ = (n: Nat): Nat => fix(new Succ(n));

export const functorNat: Functor1<URI> = {
  URI,
  map<A, B>(nat: NatF<A>, f: (a: A) => B): NatF<B> {
    return nat.map(f);
  },
};
