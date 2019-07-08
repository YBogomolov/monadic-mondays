// tslint:disable:no-unused-expression
import { expect } from 'chai';
import * as fc from 'fast-check';
import { array } from 'fp-ts/lib/Array';
import { either } from 'fp-ts/lib/Either';
import { Like, match, User, validate } from './users';

describe('User matching', () => {
  const userArbitrary = fc.unicodeString().chain(
    (login) => fc.integer().chain(
      (age) => fc.emailAddress().chain(
        (email) => fc.subarray<Like>(['cars', 'cats', 'football']).map<User>(
          (likes) => ({ login, age, email, likes }),
        ),
      ),
    ),
  );

  it('should validate a user', () => {
    fc.assert(fc.property(userArbitrary, (user) => validate(user).fold(
      (e) => {
        expect(e).to.be.an.instanceOf(Error).and.to.have.property('message').include(user.login);
      },
      (validatedUser) => {
        expect(validatedUser).to.deep.equal(user);
      },
    )));
  });

  it('should match two valid users', () => {
    fc.assert(fc.property(userArbitrary, userArbitrary, (user1, user2) => {
      fc.pre(user1.age >= 18 && user2.age >= 18);

      array.sequence(either)([validate(user1), validate(user2)]).fold(
        (validError) => {
          expect(validError.message.includes(user1.login) || validError.message.includes(user2.login)).to.be.true;
        },
        ([u1, u2]) => match(u1, u2).fold(
          (pairError) => {
            expect(pairError.message.includes(user1.login) || pairError.message.includes(user2.login)).to.be.true;
          },
          (pair) => {
            expect(pair[0]).to.deep.equal(u1).and.deep.equal(user1);
            expect(pair[1]).to.deep.equal(u2).and.deep.equal(user2);
          },
        ),
      );
    }));
  });
});
