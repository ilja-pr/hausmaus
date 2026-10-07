/*
 * Kleines expect() für node:test (kein Vite/Vitest nötig). Deckt genau die Prüfungen ab, die die Tests nutzen.
 */
import assert from 'node:assert/strict';

export { describe, it } from 'node:test';

function matchers(actual: unknown, negate: boolean) {
  const check = (pass: boolean, msg: string) => {
    if (pass === negate) assert.fail(`${negate ? 'nicht ' : ''}${msg}`);
  };
  const s = (v: unknown) => JSON.stringify(v);
  return {
    toBe: (e: unknown) => check(Object.is(actual, e), `erwartet ${s(e)}, ist ${s(actual)}`),
    toEqual: (e: unknown) => {
      let ok = true;
      try {
        assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(e)));
      } catch {
        ok = false;
      }
      check(ok, `erwartet ${s(e)}, ist ${s(actual)}`);
    },
    toBeCloseTo: (e: number, digits = 2) => check(Math.abs((actual as number) - e) < 10 ** -digits / 2, `≈ ${e} (${digits} Stellen), ist ${actual}`),
    toBeNull: () => check(actual === null, `null erwartet, ist ${s(actual)}`),
    toBeUndefined: () => check(actual === undefined, `undefined erwartet, ist ${s(actual)}`),
    toContain: (e: unknown) => check((actual as string | unknown[]).includes(e as never), `${s(actual)} enthält ${s(e)}`),
    toHaveLength: (n: number) => check((actual as { length: number }).length === n, `Länge ${n}, ist ${(actual as { length: number }).length}`),
    toMatch: (re: RegExp | string) => check(typeof re === 'string' ? String(actual).includes(re) : re.test(String(actual)), `${s(actual)} passt zu ${re}`),
    toBeGreaterThanOrEqual: (n: number) => check((actual as number) >= n, `${actual} ≥ ${n}`),
    toBeLessThan: (n: number) => check((actual as number) < n, `${actual} < ${n}`),
    toBeLessThanOrEqual: (n: number) => check((actual as number) <= n, `${actual} ≤ ${n}`),
    toThrow: (re?: RegExp | string) => {
      let err: unknown = null;
      try {
        (actual as () => unknown)();
      } catch (e) {
        err = e;
      }
      const msg = err instanceof Error ? err.message : String(err);
      check(err !== null && (!re || (typeof re === 'string' ? msg.includes(re) : re.test(msg))), `Fehler erwartet${re ? ` (${re})` : ''}`);
    },
  };
}

export function expect(actual: unknown) {
  return { ...matchers(actual, false), not: matchers(actual, true) };
}
