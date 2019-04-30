import { log } from 'fp-ts/lib/Console';
import { Type, URIS } from 'fp-ts/lib/HKT';
import { identity, URI as IdURI } from 'fp-ts/lib/Identity';
import { none, Option, some } from 'fp-ts/lib/Option';
import { randomInt } from 'fp-ts/lib/Random';
import { fromIO, Task, task, URI as TaskURI } from 'fp-ts/lib/Task';
import { createInterface } from 'readline';

export interface ProgramSyntax<F extends URIS, A> {
  map: <B>(f: (a: A) => B) => _<F, B>;
  chain: <B>(f: (a: A) => _<F, B>) => _<F, B>;
}

export type _<F extends URIS, A> = Type<F, A> & ProgramSyntax<F, A>;

export interface Program<F extends URIS> {
  terminate: <A>(a: A) => _<F, A>;
}

export interface Console<F extends URIS> {
  print: (message: string) => _<F, void>;
  read: _<F, string>;
}

export interface Random<F extends URIS> {
  nextInt: (upper: number) => _<F, number>;
}

export type Main<F extends URIS> = Program<F> & Console<F> & Random<F>;

const parse = (s: string): Option<number> => {
  const i = Number(s);
  return isNaN(i) || i % 1 !== 0 ? none : some(i);
};

const generateRandom = <F extends URIS>(F: Program<F> & Random<F>) =>
  (upper: number): _<F, number> => F.nextInt(upper);

const getUpperStr = <F extends URIS>(F: Program<F> & Console<F>): _<F, string> =>
  F.print('Enter random upper bound:').chain(
    () => F.read,
  );

const checkContinue = <F extends URIS>(F: Program<F> & Console<F>): _<F, boolean> =>
  F.print(`Do you want to continue?`)
    .chain(() => F.read)
    .chain((answer) => {
      switch (answer.toLowerCase()) {
        case 'y':
          return F.terminate(true);
        case 'n':
          return F.terminate(false);
        default:
          return checkContinue(F);
      }
    });

const main = <F extends URIS>(F: Main<F>): _<F, void> =>
  getUpperStr(F).chain(
    (upper) => parse(upper).foldL(
      () => F.print(`"${upper}" is not an integer`),
      (upperN) => generateRandom(F)(upperN).chain(
        (rand) => F.print(`Your random is: ${rand}`),
      ),
    ).chain(() => checkContinue(F).chain(
      (answer) => answer ?
        main(F) :
        F.print('Good-bye').chain(
          () => F.terminate(undefined),
        ),
    )),
  );

const programTask: Program<TaskURI> = {
  terminate: task.of,
};

const randomTask: Random<TaskURI> = {
  nextInt: (upper) => fromIO(randomInt(0, upper)),
};

const consoleTask: Console<TaskURI> = {
  read: new Task(
    () => new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('> ', (answer) => {
        rl.close();
        resolve(answer);
      });
    }),
  ),
  print: (message: string): Task<void> => fromIO(log(message)),
};

export const mainTask = main({
  ...programTask,
  ...randomTask,
  ...consoleTask,
});

mainTask.run();

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
