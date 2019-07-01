import { State } from 'fp-ts/lib/State';

import { Console, main, Program, Random } from './tagless';

// TestGenerators is a tuple of [inputs, outputs, randoms]
type TestCases = [string[], string[], number[]];

// We need this to "downcast" 2-hole State<S, A> into 1-hole type:
const TestStateURI = 'TestState';
type TestStateURI = typeof TestStateURI;

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    TestState: TestState<A>;
  }
}

type TestState<A> = State<TestCases, A>;

const programTestState: Program<TestStateURI> = {
  terminate: <A>(a: A) => new State((data) => [a, data]),
};

const consoleTestState: Console<TestStateURI> = {
  print: (message: string) => new State(
    ([inputs, outputs, randoms]) => [undefined, [inputs, [...outputs, message], randoms]],
  ),

  read: new State(
    ([inputs, outputs, randoms]) => [inputs[0], [inputs.slice(1), outputs, randoms]],
  ),
};

const randomTestState: Random<TestStateURI> = {
  nextInt: (_upper) => new State(
    ([inputs, outputs, randoms]) => [randoms[0], [inputs, outputs, randoms.slice(1)]],
  ),
};

const mainTestState = main({ ...programTestState, ...consoleTestState, ...randomTestState });

describe('Tagless Final tests', () => {
  // Note that tests are strictly synchronous!
  it('should generate random number based on input seed', () => {
    const testExample: TestCases = [['42', 'n'], [], [16]];

    expect(mainTestState.run(testExample)).toStrictEqual([
      undefined,
      [
        [],
        [
          'Enter random upper bound:',
          'Your random is: 16',
          'Do you want to continue?',
          'Good-bye',
        ],
        [],
      ],
    ]);
  });

  it('should allow several rounds of generation', () => {
    const randoms = [16, 17];
    const testExample: TestCases = [['42', 'y', '21', 'n'], [], randoms];

    expect(mainTestState.run(testExample)).toStrictEqual([
      undefined,
      [
        [],
        [
          'Enter random upper bound:',
          `Your random is: ${randoms[0]}`,
          'Do you want to continue?',
          'Enter random upper bound:',
          `Your random is: ${randoms[1]}`,
          'Do you want to continue?',
          'Good-bye',
        ],
        [],
      ],
    ]);
  });
});
