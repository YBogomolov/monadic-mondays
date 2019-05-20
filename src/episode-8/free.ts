import { foldFree, liftF } from 'fp-ts/lib/Free';
import { identity } from 'fp-ts/lib/function';

import { Identity, identity as id } from 'fp-ts/lib/Identity';

import { delay, Task, task } from 'fp-ts/lib/Task';
import fs from 'fs';

// Data structure we'll be working with:
interface File {
  handle: fs.promises.FileHandle;
  isOpen: boolean;
}

// Some boilerplate for higher-kinded types:
const OpsFURI = 'Ops';
type OpsFURI = typeof OpsFURI;

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    Ops: OpsF<A>;
  }
}

// Our eDSL – building blocks of our small application:
type OpsF<A> = OpenFile<A> | ReadLine<A> | Log<A> | CloseFile<A>;

class OpenFile<A> {
  readonly _tag: 'OpenFile' = 'OpenFile';
  readonly _A!: A;
  readonly _URI!: OpsFURI;
  constructor(readonly name: string, readonly next: (file: File) => A) { }
}

class ReadLine<A> {
  readonly _tag: 'ReadLine' = 'ReadLine';
  readonly _A!: A;
  readonly _URI!: OpsFURI;
  constructor(readonly file: File, readonly next: (a: [string, File]) => A) { }
}

class Log<A> {
  readonly _tag: 'Log' = 'Log';
  readonly _A!: A;
  readonly _URI!: OpsFURI;
  constructor(readonly message: string, readonly next: () => A) { }
}

class CloseFile<A> {
  readonly _tag: 'CloseFile' = 'CloseFile';
  readonly _A!: A;
  readonly _URI!: OpsFURI;
  constructor(readonly file: File, readonly next: (file: File) => A) { }
}

// Helpers for building eDSL expressions.
// Note that in general we have a possibility to fiddle with values as they are getting returned in `next` part:
const open = (name: string) => liftF(new OpenFile(name, identity));
const readLine = (file: File) => liftF(new ReadLine(file, identity));
const log = (message: string) => liftF(new Log(message, () => void 0));
const closeFile = (file: File) => liftF(new CloseFile(file, identity));

// This is our program – just a value, nothing REALLY happens here,
// we just declare our intentions:
const program = open('./src/episode-8/file.csv')
  .chain((file) => log(`File is open: ${file.isOpen}`).chain(() => readLine(file)))
  .chain(([line, file]) => log(line).chain(() => readLine(file)))
  .chain(([line, file]) => log(line).chain(() => closeFile(file)))
  .chain((file) => log(`File is open: ${file.isOpen}`));

// Interpreters:

const exaustive = (x: never): never => x;

let position = 0;
const lines = ['first line', 'second line'];

const identityInterpreter = <A>(fa: OpsF<A>): Identity<A> => {
  switch (fa._tag) {
    case 'OpenFile':
      // I'm stubbing the `handle` with null here, as my Identity interpreter won't be using it:
      return id.of(fa.next({ isOpen: true, handle: null as unknown as fs.promises.FileHandle }));

    case 'ReadLine':
      return id.of(fa.next([lines[position++], fa.file]));

    case 'Log':
      return id.of(fa.next());

    case 'CloseFile':
      return id.of(fa.next({ isOpen: false, handle: null as unknown as fs.promises.FileHandle }));
  }

  // A little trick: if you add a call to `exaustive`,
  // the compiler will force you to use all possible `_tag` values in switch!
  return exaustive(fa);
};

const taskInterpreter = <A>(fa: OpsF<A>): Task<A> => {
  switch (fa._tag) {
    case 'OpenFile':
      return new Task(
        () => fs.promises.open(fa.name, 'r')
          .then((handle) => fa.next({ isOpen: true, handle })),
      );

    case 'ReadLine':
      console.timeLog('TASK', 'Read line');
      return new Task(
        () => fa.file.handle.read(Buffer.from(new ArrayBuffer(24), 0, 24), 0, 24)
          .then(({ buffer }) => buffer.toString()),
      ).chain((line) => task.of(fa.next([line, fa.file])));

    case 'Log':
      console.log('>>>>>', fa.message);
      // Let's pretend that we're logging to DB here, hence the
      return delay(500, undefined).chain(() => {
        console.timeLog('TASK', 'Log');
        return task.of(fa.next());
      });

    case 'CloseFile':
      return new Task(() => fa.file.handle.close()).chain(() => {
        console.timeLog('TASK', 'Close file');
        return task.of(fa.next({ ...fa.file, isOpen: false }));
      });
  }

  return exaustive(fa);
};

console.log('Id interpreter');
const resId = foldFree(id)(identityInterpreter, program);
console.log(resId.value);

console.log('\nTask interpreter');
const resTask = foldFree(task)(taskInterpreter, program);
console.time('TASK');
resTask.run().then(() => console.timeEnd('TASK'));

/*
> ts-node ./src/episode-8/free.ts

Id interpreter
undefined

Task interpreter
>>>>> File is open: true
TASK: 506.466ms Log
TASK: 506.756ms Read line
>>>>> this is our first line!

TASK: 1013.263ms Log
TASK: 1013.459ms Read line
>>>>> this is the second line

TASK: 1518.309ms Log
TASK: 1518.753ms Close file
>>>>> File is open: false
TASK: 2021.198ms Log
TASK: 2021.623ms
*/
