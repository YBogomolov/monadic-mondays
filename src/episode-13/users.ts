import { Either, left, right } from 'fp-ts/lib/Either';

export type Like = 'cars' | 'cats' | 'football';

export interface User {
  login: string;
  age: number;
  email: string;
  likes: Like[];
}

export const validate = (user: User): Either<Error, User> =>
  user.age < 18 ? left(new Error(`User ${user.login} must be over 18`)) : right(user);

export const match = (user1: User, user2: User): Either<Error, [User, User]> => {
  // if both users have at least something in common:
  if (user1.likes.some((like) => user2.likes.includes(like))) {
    return right([user1, user2]);
  }

  return left(new Error(`No common likes for ${user1.login} and ${user2.login}`));
};
