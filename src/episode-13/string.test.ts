import * as fc from 'fast-check';

describe('Identity laws for string', () => {
  it('any Unicode string should contain itself', () => {
    fc.assert(fc.property(fc.fullUnicodeString(), (str) => str.includes(str)));
  });

  it('should fail with counterexample', () => {
    fc.assert(fc.property(fc.fullUnicodeString(), (str) => str.trim().includes(str)));
  });
});
