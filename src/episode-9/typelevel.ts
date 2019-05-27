/**
 * Conditional: if `T` extends `U`, then returns `True` type, otherwise `False` type
 */
export type If<T, U, True, False> = [T] extends [U] ? True : False;

/**
 * If `T` is defined (not `never`), then resulting type is equivalent to `True`, otherwise to `False`.
 */
export type IfDef<T, True, False> = If<T, never, False, True>;

/**
 * If `MaybeNever` type is `never`, then a `Fallback` is returned. Otherwise `MaybeNever` type is returned as is.
 */
export type OrElse<MaybeNever, Fallback> = IfDef<MaybeNever, MaybeNever, Fallback>;

/**
 * Intersection of types
 */
export type Intersect<A extends {}, B extends {}> =
  Pick<A, Exclude<keyof A, Exclude<keyof A, keyof B>>> extends { [x: string]: never } & { [x: number]: never } ?
  never :
  Pick<A, Exclude<keyof A, Exclude<keyof A, keyof B>>>;

/**
 * Makes a sum type out of given partial type, in which at least one field is required.
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> & { [K in Keys]: Required<Pick<T, K>> }[Keys];

/**
 * Ensures that T never widens S.
 */
export type Exact<S extends {}, T extends S> = S & Record<Exclude<keyof T, keyof S>, never>;

// Type-level assertions which is possible to compile only if parameter is inferred to a non-bottom type:
export const assertType = <T>(expect: [T] extends [never] ? never : T): T => expect;
