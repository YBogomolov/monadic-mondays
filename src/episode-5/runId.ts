import { identity, URI as IdURI } from 'fp-ts/lib/Identity';

import { Console, generateRandom, getUpperStr, Program, Random } from './tagless';

const programId: Program<IdURI> = {
  terminate: identity.of,
};

const randomId: Random<IdURI> = {
  nextInt: (upper) => identity.of(upper),
};

const consoleId: Console<IdURI> = {
  print: (_message) => identity.of(undefined),
  read: identity.of('42'),
};

console.log(
  generateRandom({ ...programId, ...randomId })(
    +getUpperStr({ ...programId, ...consoleId }).fold((x) => x),
  ).toString(),
); // => new Identity(42)
