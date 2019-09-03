import { IfDef, Intersect } from './typelevel';

export const neverIntersect = <
  A extends {},
  B extends {},
  // Typelevel law: A and B should not intersect
  NeverIntersect extends IfDef<Intersect<A, B>, never, {}> = IfDef<Intersect<A, B>, never, {}>
>(a: A & NeverIntersect, b: B & NeverIntersect): A & B & NeverIntersect => ({ ...a, ...b });
