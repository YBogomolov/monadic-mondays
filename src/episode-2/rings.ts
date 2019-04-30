import { none, Option, some } from 'fp-ts/lib/Option';
import { getTupleRing, Ring } from 'fp-ts/lib/Ring';

const safeOptionRing: Ring<Option<number>> = {
  zero: none,
  one: some(1),
  add: (x, y) => x.fold(y, (_x) => y.fold(x, (_y) => some(_x + _y))),
  sub: (x, y) => x.fold(y, (_x) => y.fold(x, (_y) => some(_x - _y))),
  mul: (x, y) => x.fold(y, (_x) => y.fold(x, (_y) => some(_x * _y))),
};

const strictOptionRing: Ring<Option<number>> = {
  zero: none,
  one: some(1),
  add: (x, y) => x.fold(none, (_x) => y.fold(none, (_y) => some(_x + _y))),
  sub: (x, y) => x.fold(none, (_x) => y.fold(none, (_y) => some(_x - _y))),
  mul: (x, y) => x.fold(none, (_x) => y.fold(none, (_y) => some(_x * _y))),
};

const a: Option<number> = some(42);
const b: Option<number> = none;
const c: Option<number> = some(21);

// safe only:
const R1 = getTupleRing(safeOptionRing, safeOptionRing, safeOptionRing);

console.log(R1.add([a, b, c], [b, a, c])); // => [ some(42), some(42), some(42) ]
console.log(R1.add([a, b, c], R1.one)); // => [ some(43), some(1), some(22) ]
console.log(R1.sub([a, b, c], R1.zero)); // => [ some(42), none, some(21) ]
console.log(R1.mul([a, b, c], [a, b, c])); // => [ some(1764), none, some(441) ]

// strict only:
const R2 = getTupleRing(strictOptionRing, strictOptionRing, strictOptionRing);

console.log(R2.add([a, b, c], [b, a, c])); // => [ none, none, some(42) ]
console.log(R2.add([a, b, c], R2.one)); // => [ some(43), none, some(22) ]
console.log(R2.sub([a, b, c], R2.zero)); // => [ none, none, none ]
console.log(R2.mul([a, b, c], [a, b, c])); // => [ some(1764), none, some(441) ]

// mix&match:
const R3 = getTupleRing(strictOptionRing, safeOptionRing, strictOptionRing);

console.log(R3.add([a, b, c], [b, a, c])); // => [ none, some(42), some(42) ]
console.log(R3.add([a, b, c], R3.one)); // => [ some(43), some(1), some(22) ]
console.log(R3.sub([a, b, c], R3.zero)); // => [ none, none, none ]
console.log(R3.mul([a, b, c], [a, b, c])); // => [ some(1764), none, some(441) ]
