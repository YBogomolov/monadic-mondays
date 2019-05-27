import { neverIntersect } from '../functions';
import { AtLeastOne, Exact, If, IfDef, Intersect, OrElse } from '../typelevel';

type Assertion1 = If<string, boolean, never, true>; // $ExpectType true
type Assertion2 = If<string, string, true, never>; // $ExpectType true
type Assertion3 = IfDef<string, true, never>; // $ExpectType true
type Assertion4 = IfDef<string | never, true, never>; // $ExpectType true
type Assertion5 = IfDef<string & never, never, true>; // $ExpectType true
type Assertion6 = OrElse<string, true>; // $ExpectType string
type Assertion7 = OrElse<never, true>; // $ExpectType true

interface A { foo: string; }
interface B { bar: number; }
interface C { foo: string; baz: boolean; }

type AnB = Intersect<A, B>;
type Assertion8 = IfDef<AnB, never, true>; // $ExpectType true
type AnC = Intersect<A, C>;
type Assertion9 = If<AnC, { foo: string }, true, never>; // $ExpectType true

interface T {
  foo?: string;
  bar?: number;
  baz?: boolean;
}

type ALOT = AtLeastOne<T>;
type Assertion10 = If<ALOT, { foo: string } | { bar: number } | { baz: boolean }, true, never>; // $ExpectType true

type Assertion11 = If<Exact<A, C>, A, true, never>; // $ExpectType true
type Assertion12 = If<Exact<A, C>['baz'], never, true, never>; // $ExpectType true

neverIntersect<A, B>({ foo: 'foo' }, { bar: 42 });
neverIntersect<A, A>({ foo: 'foo' }, { foo: 'foo' }); // $ExpectError
