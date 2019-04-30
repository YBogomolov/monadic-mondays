// tslint:disable:max-line-length
import { constant } from 'fp-ts/lib/function';
import { Functor, Functor1, Functor2, Functor3 } from 'fp-ts/lib/Functor';
import { Type, Type2, Type3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT';

import { match } from './match';

import { Algebra, Fix, unfix } from './Fix';
import { functorNat, Nat, NatF, succ, zero } from './Nat';

export function cata<F extends URIS3>(F: Functor3<F>, ): <U, L, A>(algebra: (fa: Type3<F, U, L, A>) => A) => (term: Fix<F>) => A;
export function cata<F extends URIS2>(F: Functor2<F>): <L, A>(algebra: (fa: Type2<F, L, A>) => A) => (term: Fix<F>) => A;
export function cata<F extends URIS>(F: Functor1<F>): <A>(algebra: (fa: Type<F, A>) => A) => (term: Fix<F>) => A;
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A;
export function cata<F>(F: Functor<F>): <A>(algebra: Algebra<F, A>) => (term: Fix<F>) => A {
  return <A>(algebra: Algebra<F, A>) =>
    function self(term): A {
      return algebra(F.map(unfix(term), self));
    };
}

const idAlg = (n: NatF<number>): number => match(n._tag)({
  Zero: constant(0),
  Succ: () => 1 + n.value,
});

const toNumber = (n: Nat): number => cata(functorNat)(idAlg)(n);

const plusAlg = (a: Nat) => (n: NatF<Nat>): Nat => match(n._tag)({
  Zero: constant(a),
  Succ: () => succ(n.value),
});

const plus = (a: Nat) => (b: Nat): Nat => cata(functorNat)(plusAlg(a))(b);

const timesAlg = (a: Nat) => (n: NatF<Nat>): Nat => match(n._tag)({
  Zero: constant(zero),
  Succ: () => plus(a)(n.value),
});

const times = (a: Nat) => (b: Nat): Nat => cata(functorNat)(timesAlg(a))(b);

console.log(toNumber(plus(succ(succ(zero)))(succ(succ(succ(zero))))));
console.log(toNumber(times(succ(succ(zero)))(succ(succ(succ(zero))))));
