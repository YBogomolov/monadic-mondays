import * as fc from 'fast-check';
import { either, Either, left, right } from 'fp-ts/lib/Either';
import { compose, identity } from 'fp-ts/lib/function';

describe('Either', () => {
  describe('Functor laws', () => {
    it('should preserve identity morphism', () => {
      fc.assert(fc.property(fc.anything(), (x) => {
        expect(right(x).map(identity)).toEqual(right(x));
        expect(left(x).map(identity)).toEqual(left(x));
      }));
    });

    it('should preserve composition of morphisms', () => {
      fc.assert(fc.property(fc.anything(), fc.func(fc.anything()), fc.func(fc.anything()), (x, f, g) => {
        const g_o_f = compose(g, f);

        expect(right(x).map(f).map(g)).toEqual(right(x).map(g_o_f));
        expect(left(x).map(f).map(g)).toEqual(left(x).map(g_o_f));
      }));
    });
  });

  describe('Monad laws', () => {
    it('left identity', () => {
      fc.assert(fc.property(fc.anything(), (x) => {
        const f = (a: unknown) => typeof a === 'string' ? left(a) : right(a);

        expect(right(x).chain(f)).toEqual(f(x));
      }));
    });

    it('right identity', () => {
      fc.assert(fc.property(fc.anything(), (x) => {
        expect(right(x).chain(either.of)).toEqual(right(x));
        expect(left(x).chain(either.of)).toEqual(left(x));
      }));
    });

    it('associativity', () => {
      fc.assert(fc.property(fc.anything(), (x) => {
        const m = either.of<unknown, unknown>(x);
        const f = (a: unknown): Either<unknown, number> => typeof a === 'string' ? right(a.length) : left(a);
        const g = (n: number): Either<number, number> => n > 0 ? right(n * 10) : left(n);

        expect(m.chain(f).chain(g)).toEqual(m.chain((a) => f(a).chain(g)));
      }));
    });
  });
});
