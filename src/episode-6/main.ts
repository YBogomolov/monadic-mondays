import { log } from 'fp-ts/lib/Console';
import { none, Option, some } from 'fp-ts/lib/Option';
import { randomInt } from 'fp-ts/lib/Random';
import * as task from 'fp-ts/lib/Task';
import { taskEither } from 'fp-ts/lib/TaskEither';
import { createInterface } from 'readline';

import { ask, fromIO, Task, TIO, tio } from './tio';

export interface MainEnvironment {
  lowerBound: number;
}

export const parse = (s: string): Option<number> => {
  const i = Number(s);
  return isNaN(i) || i % 1 !== 0 ? none : some(i);
};

export const generateRandom = (upper: number): TIO<MainEnvironment, never, number> =>
  ask().chain(({ lowerBound }) => fromIO(randomInt(lowerBound, upper)));

export const read: Task<string> = new TIO(() => taskEither.fromTask(
  new task.Task<string>(
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
));

export const terminate = tio.of;

export const print = (message: string): Task<void> => fromIO(log(message));

export const getUpperStr: Task<string> =
  print('Enter random upper bound:')
    .chain(() => read);

export const checkContinue: Task<boolean> =
  print(`Do you want to continue?`)
    .chain(() => read)
    .chain((answer) => {
      switch (answer.toLowerCase()) {
        case 'y':
          return terminate(true);
        case 'n':
          return terminate(false);
        default:
          return checkContinue;
      }
    });

export const main: TIO<MainEnvironment, never, void> = getUpperStr.chain(
  (upper) => parse(upper).foldL(
    () => print(`"${upper}" is not an integer`),
    (upperN) => generateRandom(upperN).chain(
      (rand) => print(`Your random is: ${rand}`),
    ),
  ).chain(() => checkContinue.chain(
    (answer) => answer ? main : print('Good-bye').chain(() => terminate(undefined)),
  )),
);
