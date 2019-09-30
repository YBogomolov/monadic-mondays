// tslint:disable:no-shadowed-variable

// Inspired by https://github.com/Munksgaard/session-types

interface Chan<Env, Protocol> {
  env_and_protocol: [Env, Protocol];
}

class Eps implements HasDual {
  readonly tag: 'Eps' = 'Eps';
  readonly dual!: Eps;
}

abstract class Send<A, Protocol> implements HasDual {
  readonly dual!: Recv<A, Dual<Protocol>>;
  readonly tag: 'Send' = 'Send';
}

abstract class Recv<A, Protocol> implements HasDual {
  readonly dual!: Send<A, Dual<Protocol>>;
  readonly tag: 'Recv' = 'Recv';
}

interface HasDual {
  dual: HasDual;
}

type ExtractProtocol<C> = C extends Chan<infer _, infer P> ? P : never;
type ExtractEnv<C> = C extends Chan<infer E, infer _> ? E : never;

type Dual<X> =
  X extends Send<infer A, infer P> ? Recv<A, P extends HasDual ? P['dual'] : never> :
  X extends Recv<infer A, infer P> ? Send<A, P extends HasDual ? P['dual'] : never> :
  X extends Eps ? Eps :
  never;

declare const connect: <A, B extends Dual<A>>(_server: Chan<void, A>, _client: Chan<void, B>) => void;

declare const srv: Chan<void, Send<number, Recv<boolean, Recv<Float32Array, Eps>>>>;
declare const cli: Chan<void, Dual<ExtractProtocol<typeof srv>>>;
declare const cli2: Chan<void, Recv<string, Send<boolean, Send<Float32Array, Eps>>>>;

connect(srv, cli); // Ok
connect(cli, srv); // Ok
connect(srv, cli2); // Type 'string' is not assignable to type 'number'
connect(srv, srv); // Type 'Send<boolean, Eps>' is not assignable to type 'Recv<boolean, Eps>'
connect(cli, cli); // Type 'Send<boolean, Eps>' is not assignable to type 'Recv<boolean, Eps>'
