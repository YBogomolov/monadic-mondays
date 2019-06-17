import { taskEither, tryCatch, URI } from 'fp-ts/lib/TaskEither';
import { getInstancesFor, KleisliIO } from 'kleisli-ts/lib';
import { createInterface } from 'readline';

const K = getInstancesFor(taskEither);

export const parse: KleisliIO<URI, Error, string, number> =
  K.ifThenElse<Error, string, number>
    (K.liftK((s: string) => {
      const i = +s;
      return isNaN(i) || i % 1 !== 0;
    }))
    (K.identity<Error, string>().chain((s) => K.fail(new Error(s + ' is not a number'))))
    (K.liftK(Number));

export const generateRandom: KleisliIO<URI, never, number, number> =
  K.impureVoid((lowerBound) => Math.floor(Math.random() * lowerBound + 1));

export const read: KleisliIO<URI, Error, void, string> =
  K.pure(
    () => tryCatch(() => new Promise<string>((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('> ', (answer) => {
        rl.close();
        resolve(answer);
      });
    }), (e) => new Error(String(e))),
  );

export const print: KleisliIO<URI, never, string, void> =
  K.impureVoid((message: string) => console.log(message));

export const getUpperStr: KleisliIO<URI, Error, void, string> =
  K.of<Error, void, string>('Enter random upper bound:')
    .andThen(print)
    .andThen(read);

export const checkContinue: KleisliIO<URI, Error, void, boolean> =
  K.of<Error, void, string>('Do you want to continue?')
    .andThen(print)
    .andThen(read)
    .chain((answer) => {
      switch (answer.toLowerCase()) {
        case 'y':
          return K.of(true);
        case 'n':
          return K.of(false);
        default:
          return checkContinue;
      }
    });

export const main: KleisliIO<URI, Error, void, void> =
  getUpperStr
    .andThen(parse)
    .andThen(generateRandom)
    .chain((rnd) => K.of<Error, void, string>(`Your random is: ${rnd}`).andThen(print))
    .andThen(checkContinue)
    .chain((answer) => answer ? main : K.of<Error, void, string>('Good-bye').andThen(print));
