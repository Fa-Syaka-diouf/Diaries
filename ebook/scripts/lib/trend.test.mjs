// Sanity checks for the trend statistics: `node scripts/lib/trend.test.mjs`
import assert from 'node:assert/strict';
import { mannKendallSen, normalCdf } from './trend.mjs';

// Normal CDF reference values
assert.ok(Math.abs(normalCdf(0) - 0.5) < 1e-7);
assert.ok(Math.abs(normalCdf(1.959964) - 0.975) < 1e-6);
assert.ok(Math.abs(normalCdf(-1) - 0.158655) < 1e-6);

// Perfect linear series: slope exactly 2, maximal S, highly significant
const lin = Array.from({ length: 20 }, (_, i) => ({ t: 2000 + i, v: 5 + 2 * i }));
const a = mannKendallSen(lin);
assert.equal(a.S, (20 * 19) / 2);
assert.equal(a.senSlope, 2);
assert.equal(a.kendallTau, 1);
assert.ok(a.pValue < 1e-6);
assert.equal(a.direction, 'increasing');

// Hand-checked small example (n = 10)
// values: 1,3,2,5,4,6,8,7,9,10 -> S = 39 discordant-adjusted; VarS = 125
const b = mannKendallSen([1, 3, 2, 5, 4, 6, 8, 7, 9, 10].map((v, i) => ({ t: i, v })));
assert.equal(b.S, 39);
assert.equal(b.varS, 125);
assert.ok(Math.abs(b.Z - 38 / Math.sqrt(125)) < 1e-12);
assert.equal(b.senSlope, 1);

// Flat series with alternating noise: not significant
const flat = Array.from({ length: 30 }, (_, i) => ({ t: i, v: i % 2 ? 1 : -1 }));
const c = mannKendallSen(flat);
assert.equal(c.significant, false);

// Decreasing series
const dec = Array.from({ length: 15 }, (_, i) => ({ t: i, v: 100 - 3 * i + (i % 3) * 0.5 }));
assert.equal(mannKendallSen(dec).direction, 'decreasing');

console.log('trend.mjs: all checks passed');
