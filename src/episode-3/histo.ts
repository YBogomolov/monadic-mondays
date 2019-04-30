import { partition } from 'fp-ts/lib/Array';
import { constant } from 'fp-ts/lib/function';
import { Functor, Functor1 } from 'fp-ts/lib/Functor';
import { Type, URIS } from 'fp-ts/lib/HKT';

import { match } from './match';

import { attribute, Cofree, cofree, CVAlgebra, Fix, hole, unfix } from './Fix';
import { functorNat, Nat, NatF, succ, URI, zero } from './Nat';

export function histo<F extends URIS>(F: Functor1<F>): <A>(h: (fa: Type<F, Cofree<F, A>>) => A) => (term: Fix<F>) => A;
export function histo<F>(F: Functor<F>): <A>(h: CVAlgebra<F, A>) => (term: Fix<F>) => A {
  return <A>(h: CVAlgebra<F, A>) => {
    return function self(term): A {
      const worker = (t: Fix<F>): Cofree<F, A> => {
        const calc = F.map(unfix(t), worker);
        return cofree(h(calc), calc);
      };
      return attribute(worker(term));
    };
  };
}

// NatC – cofree wrapper around our target solution type - list of "ways of change",
// i.e. all possible combinations of change for the given amount:
export type NatC = Cofree<URI, number[][]>;

// Convert plain JavaScript `number` into Peano number:
const expand = (amt: number): Nat => amt === 0 ? zero : succ(expand(amt - 1));

// Convert Peano number back to `number`:
const compress = (n: NatF<NatC>): number => match(n._tag)({
  Zero: constant(0),
  Succ: () => 1 + compress(hole(n.value)),
});

const lookup = <A>(cache: Cofree<URI, A>, n: number): A =>
  n === 0 ? attribute(cache) : lookup(hole(cache).value, n - 1);

const COINS = [1, 5, 10, 25, 50];

const change = (amt: number): number[][] => {
  const go = (curr: NatF<NatC>) => match(curr._tag)({
    Zero: constant([[]]),
    Succ: () => {
      const given: number = compress(curr);
      const validCoins = COINS.filter((c) => c <= given);
      // This is what differs: we store not only the sum of ways, but the exact solution itself:
      const remaining: Array<[number, number]> = validCoins.map((c) => ([c, given - c]));
      const { right: zeroes, left: toProcess } = partition(remaining, (a) => a[1] === 0);
      const results: number[][][] = toProcess.map(
        ([coin, remainder]) => lookup(curr.value, given - 1 - remainder).reduce<number[][]>(
          (arr, coins) => (coins.every((c) => c <= coin) && arr.push([coin, ...coins]), arr),
          [],
        ),
      );
      return zeroes.map(([c]) => [c]).concat(...results);
    },
  });

  return histo(functorNat)(go)(expand(amt));
};

[15, 20, 42].forEach((coin) => {
  const changes = change(coin);
  console.log(`${coin} -> ${changes.length} ways`);
  console.log(changes.map((c) => c.join()).join('\n'));
  console.log();
});
