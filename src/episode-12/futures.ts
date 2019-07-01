import * as F from 'fluture';
import fetch from 'node-fetch';

const fetchF = F.encaseP(fetch);

const getUserLogin = fetchF('https://api.github.com/users/YBogomolov')
  .chain((res) => F.tryP(() => res.json()))
  .map<string>((user) => user.login);

getUserLogin
  .race(F.rejectAfter<Error, string>(1000)(new Error('timeout')))
  .fork(console.error, console.log);

const add100000 = function self(x: number): F.FutureInstance<{}, number> {
  const mx = F.of(x + 1);
  return x < 100000 ? mx.chain(self) : mx;
};

add100000(1).fork(console.error, console.log);

const calc200002 = F.go(function*() {
  const res: number = yield add100000(1);
  const res2: number = yield add100000(1);
  return res + res2;
});

calc200002.fork(console.error, console.log);

getUserLogin
  .alt(F.of('admin'))
  .chain((login) => fetchF(`https://api.github.com/search/users?q=${login}`).chain((res) => F.tryP(() => res.json())))
  .chain((users) => users.total_count > 0 ? F.of(users.items[0]) : F.reject(new Error('not found')))
  .chain((user) => fetchF(user.repos_url).chain((res) => F.tryP(() => res.json())))
  .bimap((reason: Error) => reason.toString(), (repos) => repos.length)
  .fork(console.error, console.log);
