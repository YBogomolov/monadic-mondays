// TypeScript Version: 3.4

type False = 'f';
type True = 't';
type Bool = False | True;

// Heterogeneous lists

type HNil = { isNil: True; };
type HCons = { isNil: False; head: any; tail: HList; };
type HList = HNil | HCons;

type Cons<Head, Tail extends HList> = { isNil: False, head: Head, tail: Tail };
type Head<Xs extends HCons> = Xs['head'];
type Tail<Xs extends HCons> = Xs['tail'];
type IsNil<Xs extends HList> = Xs['isNil'];

type Reverse<Xs extends HList> = Rev<Xs, HNil>;
type Rev<Xs extends HList, T extends HList> = {
  f: Xs extends HCons ? Rev<Tail<Xs>, Cons<Head<Xs>, T>> : HNil;
  t: T;
}[IsNil<Xs>];

type ABC1 = Cons<'a', Cons<'b', Cons<'c', Cons<1, HNil>>>>;
type _1CBA = Reverse<ABC1>; // $ExpectType HCons<1, HCons<'c', HCons<'b', HCons<'a', HNil>>>>

// Peano numbers

type Zero = { isZero: True };
type Nat = Zero | { isZero: False, prev: Nat };

type Succ<N extends Nat> = { isZero: False, prev: N };
type Prev<N extends Succ<Nat>> = N['prev'];
type IsZero<N extends Nat> = N['isZero'];

type _0 = Zero;
type _1 = Succ<_0>;
type _2 = Succ<_1>;
type _3 = Succ<_2>;

type UpTo3 = Cons<_0, Cons<_1, Cons<_2, Cons<_3, HNil>>>>;
type From3 = Reverse<UpTo3>; // $ExpectType HCons<_3, HCons<_2, HCons<_1, HCons<_0, HNil>>>>
