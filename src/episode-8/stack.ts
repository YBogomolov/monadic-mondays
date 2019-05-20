// Free IO monad – representing generic computations:
const IOFURI = 'StackOps';
type IOFURI = typeof IOFURI;

type IO<A> = Return<A> | Suspend<A> | FlatMap<A>;

class Return<A> {
  readonly _tag: 'Return' = 'Return';
  readonly _A!: A;
  readonly _URI!: IOFURI;
  constructor(readonly a: A) { }
}

class Suspend<A> {
  readonly _tag: 'Suspend' = 'Suspend';
  readonly _A!: A;
  readonly _URI!: IOFURI;
  constructor(readonly resume: () => A) { }
}

class FlatMap<A> {
  readonly _tag: 'FlatMap' = 'FlatMap';
  readonly _A!: A;
  readonly _URI!: IOFURI;
  constructor(readonly fa: IO<A>, readonly f: (a: A) => IO<A>) { }
}

const exaustive = (x: never): never => x;

// Enter Trampoline!
type Trampoline<T> = T | (() => Trampoline<T>);

function trampoline<T>(firstResult: Trampoline<T>) {
  let result = firstResult;
  while (result instanceof Function) {
    result = result();
  }
  return result;
}

const run = <A>(fa: IO<A>): Trampoline<A> => {
  switch (fa._tag) {
    case 'Return':
      return fa.a;
    case 'Suspend':
      return fa.resume();
    case 'FlatMap': {
      const x = fa.fa;
      const f = fa.f;
      switch (x._tag) {
        case 'Return':
          return () => run(f(x.a));
        case 'Suspend':
          return () => run(f(x.resume()));
        default:
        case 'FlatMap':
          const y = x.fa;
          const g = x.f;
          return () => run(new FlatMap(y, (a) => new FlatMap(g(a), f)));
      }
    }
  }

  return exaustive(fa);
};

const runU = <A>(fa: IO<A>): A => {
  switch (fa._tag) {
    case 'Return':
      return fa.a;
    case 'Suspend':
      return fa.resume();
    case 'FlatMap': {
      const x = fa.fa;
      const f = fa.f;
      switch (x._tag) {
        case 'Return':
          return runU(f(x.a));
        case 'Suspend':
          return runU(f(x.resume()));
        default:
        case 'FlatMap':
          const y = x.fa;
          const g = x.f;
          return runU(new FlatMap(y, (a) => new FlatMap(g(a), f)));
      }
    }
  }

  return exaustive(fa);
};

const forever = <A>(a: IO<A>): IO<A> => new FlatMap(a, () => forever(a));

const program = forever(new Suspend(() => console.log(Date.now())));

if (process.env.FAIL === 'true') {
  runU(program);
} else {
  trampoline(run(program));
}
