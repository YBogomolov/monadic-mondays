// tslint:disable:no-any
import { Bifunctor3 } from 'fp-ts/lib/Bifunctor';
import { Either } from 'fp-ts/lib/Either';
import * as io from 'fp-ts/lib/IO';
import { Monad3 } from 'fp-ts/lib/Monad';
import * as readerT from 'fp-ts/lib/ReaderT';
import * as taskEither from 'fp-ts/lib/TaskEither';

import TaskEither = taskEither.TaskEither;

const readerTTaskEither = readerT.getReaderT2v(taskEither.taskEither);

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT3<U, L, A> {
    TIO: TIO<U, L, A>;
  }
}

export const URI = 'TIO';
export type URI = typeof URI;

export class TIO<R, E, A> {
  readonly _R!: R;
  readonly _E!: E;
  readonly _A!: A;
  readonly _URI!: URI;

  /**
   * Creates an instance of TIO.
   * @param {(e: R) => TaskEither<E, A>} value Async funcion which has access to the environment `R`,
   * may fail with `E` or succeed with `A`.
   * @memberof TIO
   */
  constructor(readonly value: (e: R) => TaskEither<E, A>) { }

  /**
   * Unwraps TIO, returning a Promise of either error or value.
   *
   * @param {R} e TIO envrionment
   * @returns {Promise<Either<E, A>>} Async result which may fail with error of type `E` or succed with `A`.
   * @memberof TIO
   */
  run(e: R): Promise<Either<E, A>> {
    return this.value(e).run();
  }

  /**
   * Monadic `chain` allows sequencing computations by applying a function `f::A -> F A` to a `F A` value
   *
   * @template R1 Type of new environment
   * @template E1 Type of new error
   * @template B Type of new result
   * @param {(a: A) => TIO<R1, E1, B>} f Function to apply to a boxed value
   * @returns {TIO<R1, E1, B>} New `TIO` container with a new value
   * @memberof TIO
   */
  chain<R1 extends R, E1, B>(f: (a: A) => TIO<R1, E1, B>): TIO<R1, E1, B>;
  chain<E1, B>(f: (a: A) => TIO<R, E1, B>): TIO<R, E1, B>;
  chain<B>(f: (a: A) => TIO<R, E, B>): TIO<R, E, B> {
    return new TIO(readerTTaskEither.chain(this.value, (a) => f(a).value));
  }

  /**
   * `ap` allows applying a function-in-context to a value-in-context
   *
   * @template R1 Type of new environment
   * @template E1 Type of new error
   * @template B Type of new result
   * @param {TIO<R1, E1, (a: A) => B>} fab Function in TIO context
   * @returns {TIO<R1, E1, B>} New `TIO` container with a new value
   * @memberof TIO
   */
  ap<R1 extends R, E1, B>(fab: TIO<R1, E1, (a: A) => B>): TIO<R1, E1, B>;
  ap<R1 extends R, B>(fab: TIO<R1, E, (a: A) => B>): TIO<R1, E, B>;
  ap<B>(fab: TIO<R, E, (a: A) => B>): TIO<R, E, B> {
    return new TIO(readerTTaskEither.ap(fab.value, this.value));
  }

  /**
   * `map` (from a `Functor`) allows us to change the type of carried value
   *
   * @template B New result type
   * @param {(a: A) => B} f Function to apply
   * @returns {TIO<R, E, B>} New `TIO` container with a new value
   * @memberof TIO
   */
  map<B>(f: (a: A) => B): TIO<R, E, B> {
    return new TIO(readerTTaskEither.map(this.value, f));
  }

  /**
   * `mapLeft` allows us to change the type of possible error
   *
   * @template E1 Type of new error
   * @param {(e: E) => E1} f Function to apply
   * @returns {TIO<R, E1, A>} new `TIO` container with a new value
   * @memberof TIO
   */
  mapLeft<E1>(f: (e: E) => E1): TIO<R, E1, A> {
    return new TIO((e) => this.value(e).mapLeft(f));
  }

  /**
   * `local` allows us to change the type of environment our Reader operates on.
   * Note that Reader is contravariant in its parameter, so we need to have a contravariant function to transform it.
   *
   * @template R1 New environment type
   * @param {(e: R1) => R} f Function to apply
   * @returns {TIO<R1, E, A>} New `TIO` container with a new value
   * @memberof TIO
   */
  local<R1 = R>(f: (e: R1) => R): TIO<R1, E, A> {
    return new TIO((e: R1) => this.value(f(e)));
  }

  /**
   * `bimap` allows us to change the error and the result type in a single pass
   *
   * @template E1 Type of a new error
   * @template B New result type
   * @param {(e: E) => E1} f Function for error transformation to apply
   * @param {(a: A) => B} g Function for value transformation
   * @returns {TIO<R, E1, B>} New `TIO` container with a new value
   * @memberof TIO
   */
  bimap<E1, B>(f: (e: E) => E1, g: (a: A) => B): TIO<R, E1, B> {
    return new TIO<R, E1, B>((e) => this.value(e).bimap(f, g));
  }

  /**
   * `trimap` allows us to change all type parameters in a single pass
   *
   * @template R1 Type of a new environment
   * @template E1 Type o a new error
   * @template B New result type
   * @param {(e: R1) => R} f Function for environment transformation
   * @param {(e: E) => E1} g Function for error transformation
   * @param {(a: A) => B} h Function for value transformation
   * @returns {TIO<R1, E1, B>} New `TIO` container with a new value
   * @memberof TIO
   */
  trimap<R1, E1, B>(f: (e: R1) => R, g: (e: E) => E1, h: (a: A) => B): TIO<R1, E1, B> {
    return new TIO<R1, E1, B>((e) => this.value(f(e)).bimap(g, h));
  }
}

export const map = <R, E, A, B>(fa: TIO<R, E, A>, f: (a: A) => B) => fa.map(f);
export const ap = <R, E, A, B>(fab: TIO<R, E, (a: A) => B>, fa: TIO<R, E, A>) => fa.ap(fab);
export const of = <R, E, A>(value: A) => new TIO<R, E, A>(() => taskEither.fromIO(io.io.of(value)));
export const fromIO = <R, E, A>(a: io.IO<A>) => new TIO<R, E, A>(() => taskEither.fromIO(a));
export const chain = <R, E, A, B>(fa: TIO<R, E, A>, f: (a: A) => TIO<R, E, B>) => fa.chain(f);
export const bimap = <R, E, E1, A, B>(fa: TIO<R, E, A>, f: (e: E) => E1, g: (a: A) => B) => fa.bimap(f, g);
export const ask = <E>(): TIO<E, never, E> => new TIO((e) => taskEither.fromIO(io.io.of(e)));

export type UIO<A> = TIO<any, never, A>;
export type Task<A> = TIO<any, Error, A>;
export type IO<E, A> = TIO<any, E, A>;

export const tio: Monad3<URI> & Bifunctor3<URI> = {
  URI,
  map,
  ap,
  of,
  chain,
  bimap,
};
