import { array } from 'fp-ts/lib/Array';
import { error, log, warn } from 'fp-ts/lib/Console';
import { io } from 'fp-ts/lib/IO';
import { both, that, These, this_ } from 'fp-ts/lib/These';

// May warn if user is under 18, or panic if user has negative age
const greet = (name: string, age: number): These<Error, string> => {
  if (age <= 0) {
    return this_(new Error(`You age cannot be less than zero! You've entered: ${age}`));
  }

  const greeting = `Hello, ${name}!`;
  if (age < 18) {
    return both(new Error('You cannot use our service at that age!'), greeting);
  }

  return that(greeting);
};

// Ex. 1: Alice is 14 years old:
const howIsAlice = greet('Alice', 14);

// Ex.2: Bob is hAx0r who tries to pen-test us:
const howIsBob = greet('Bob', -42);

// Ex. 3: Charlie is just a normie:
const howIsCharlie = greet('Charlie', 25);

array.sequence(io)([howIsAlice, howIsBob, howIsCharlie]
  .map((person) => person.fold(
    (err) => error(err.message),
    (greeting) => log(greeting),
    (err, greeting) => warn(err.message).chain(() => log(greeting)),
  ))).run();
