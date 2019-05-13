import { Iso, Lens, Optional } from 'monocle-ts';

interface Address {
  city: string;
  street: string;
  house: string;
}

interface User {
  name: string;
  age: number;
  address: Address;
}

type AddressWithApt = Address & { apt: number };

const user: User = {
  name: 'John',
  age: 32,
  address: {
    city: 'California',
    street: '1st',
    house: '42A',
  },
};

const cityLens = Lens.fromPath<User>()(['address', 'city']);

console.log(cityLens.get(user));
console.log(cityLens.set('Moscow')(user));

const addressOptional = Optional.fromNullableProp<User>()('address');
const aptLens = Lens.fromNullableProp<AddressWithApt>()('apt', -1);
const aptOptional = Optional.fromNullableProp<AddressWithApt>()('apt');

const aptFromUserOptional = addressOptional.composeLens(aptLens);
const aptFromUserOptional2 = addressOptional.compose(aptOptional);

console.log(aptFromUserOptional.getOption(user));
console.log(aptFromUserOptional2.getOption(user));

console.log(aptFromUserOptional.set(42)(user));
console.log(aptFromUserOptional2.set(42)(user));

// Note that this particular Iso cannot recreate a `User` structure from just a number,
// thus we need to provide just any default values:
const ageIso = new Iso<User, User['age']>(
  (u) => u.age,
  (age) => ({ age, name: '?', address: { city: '?', street: '?', house: '?' } }),
);

console.log(ageIso.get(user));
console.log(ageIso.reverseGet(42));
