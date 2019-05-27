import { neverIntersect } from './functions';
import { assertType, AtLeastOne, Exact, If, IfDef, Intersect, OrElse } from './typelevel';

describe('Type-level', () => {
  it('If<T, Eq, True, False>', () => {
    type Assertion1 = If<string, boolean, never, true>;
    expect(assertType<Assertion1>(true)).toBeTruthy();

    type Assertion2 = If<string, string, true, never>;
    expect(assertType<Assertion2>(true)).toBeTruthy();
  });

  it('IfDef<T, True, False>', () => {
    type Assertion1 = IfDef<string, true, never>;
    expect(assertType<Assertion1>(true)).toBeTruthy();

    type Assertion2 = IfDef<string | never, true, never>;
    expect(assertType<Assertion2>(true)).toBeTruthy();

    type Assertion3 = IfDef<string & never, never, true>;
    expect(assertType<Assertion3>(true)).toBeTruthy();
  });

  it('OrElse<A, B>', () => {
    type Assertion1 = OrElse<string, true>;
    expect(assertType<Assertion1>('some string')).toEqual('some string');

    type Assertion2 = OrElse<never, true>;
    expect(assertType<Assertion2>(true)).toBeTruthy();
  });

  it('Intersect<A, B>', () => {
    interface A { foo: string; }
    interface B { bar: number; }
    interface C { foo: string; baz: boolean; }

    type AnB = Intersect<A, B>;
    type Assertion1 = IfDef<AnB, never, true>;
    expect(assertType<Assertion1>(true)).toBeTruthy();

    type AnC = Intersect<A, C>;
    type Assertion2 = If<AnC, { foo: string }, true, never>;
    expect(assertType<Assertion2>(true)).toBeTruthy();
  });

  it('AtLeastOne<T>', () => {
    interface T {
      foo?: string;
      bar?: number;
      baz?: boolean;
    }

    type ALOT = AtLeastOne<T>;
    type Assertion1 = If<ALOT, { foo: string } | { bar: number } | { baz: boolean }, true, never>;
    expect(assertType<Assertion1>(true)).toBeTruthy();
  });

  it('Exact<S, T>', () => {
    interface A { foo: string; }
    interface B { foo: string; baz: boolean; }

    type Assertion1 = If<Exact<A, B>, A, true, never>;
    type Assertion2 = If<Exact<A, B>['baz'], never, true, never>;

    expect(assertType<Assertion1>(true)).toBeTruthy();
    expect(assertType<Assertion2>(true)).toBeTruthy();
  });

  it('neverIntersect', () => {
    interface A {
      foo: string;
    }

    interface B {
      bar: number;
    }

    const a1: A = { foo: 'foo' };
    const b1: B = { bar: 42 };

    const c1 = neverIntersect<A, B>(a1, b1);
    expect(c1).toStrictEqual({ foo: 'foo', bar: 42 });
    // $ExpectError
    // const c2 = neverIntersect<A, A>(a1, a1);
  });
});
