import { Lazy } from 'fp-ts/lib/function';

export const match = <T extends string>(toMatch: T) => <B>(ops: Record<T, Lazy<B>>) => ops[toMatch]();
