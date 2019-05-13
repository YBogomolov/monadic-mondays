import { identity } from 'fp-ts/lib/function';
import { getTupleMonoid, monoidSum } from 'fp-ts/lib/Monoid';
import { Tree, tree } from 'fp-ts/lib/Tree';
import { fromFoldable, fromTraversable, Lens } from 'monocle-ts';

interface User {
  name: string;
  age: number;
}

const hierarchy = new Tree<User>({ name: 'Boss', age: 42 }, [
  new Tree({ name: 'Manager1', age: 35 }, [
    tree.of({ name: 'Emp1', age: 45 }),
    tree.of({ name: 'Emp2', age: 64 }),
  ]),
  new Tree({ name: 'Manager2', age: 52 }, [
    tree.of({ name: 'Emp3', age: 27 }),
    tree.of({ name: 'Emp4', age: 32 }),
    tree.of({ name: 'Emp5', age: 39 }),
  ]),
]);

const ageTupleLens = new Lens<User, [number, number]>((u) => [u.age, 1], ([age, _]) => (u) => ({ ...u, age }));
const hierarchyFold = fromFoldable(tree)<User>().composeLens(ageTupleLens);

const tupleMonoid = getTupleMonoid(monoidSum, monoidSum);
const [ageSum, ageCnt] = hierarchyFold.foldMap(tupleMonoid)(identity)(hierarchy);
console.log(ageSum / ageCnt);

const hierarchyTraversal = fromTraversable(tree)<User>();
console.dir(hierarchyTraversal.modifyF(tree)(tree.of)(hierarchy), { depth: null });
console.dir(hierarchyTraversal.modify((u) => ({ ...u, name: u.name.toLocaleUpperCase() }))(hierarchy), { depth: null });
