// Non-parametric trend statistics used for every finding shown in the ebook.
//
//  - Mann–Kendall test (two-sided), with the variance correction for tied values.
//  - Sen's slope (median of all pairwise slopes) with the 95 % confidence
//    interval from Gilbert (1987), "Statistical Methods for Environmental
//    Pollution Monitoring", ch. 16.
//
// Limitation (stated in the book): no correction for serial autocorrelation
// (e.g. Hamed & Rao 1998) is applied, so p-values for strongly autocorrelated
// series may be optimistic.

/** Standard normal CDF (Abramowitz & Stegun 7.1.26, |error| < 1.5e-7). */
export function normalCdf(z) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

/**
 * @param {{t:number, v:number}[]} series  sorted by t, no missing values
 * @param {number} [alpha=0.05]
 */
export function mannKendallSen(series, alpha = 0.05) {
  const n = series.length;
  if (n < 8) throw new Error(`Series too short for Mann–Kendall (n=${n})`);

  let s = 0;
  const slopes = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = series[j].v - series[i].v;
      s += Math.sign(d);
      const dt = series[j].t - series[i].t;
      if (dt !== 0) slopes.push(d / dt);
    }
  }

  // Tie correction
  const counts = new Map();
  for (const p of series) counts.set(p.v, (counts.get(p.v) ?? 0) + 1);
  let tieTerm = 0;
  for (const t of counts.values()) if (t > 1) tieTerm += t * (t - 1) * (2 * t + 5);
  const varS = (n * (n - 1) * (2 * n + 5) - tieTerm) / 18;

  const z = s > 0 ? (s - 1) / Math.sqrt(varS) : s < 0 ? (s + 1) / Math.sqrt(varS) : 0;
  const p = 2 * (1 - normalCdf(Math.abs(z)));
  const tau = s / ((n * (n - 1)) / 2);

  slopes.sort((a, b) => a - b);
  const N = slopes.length;
  const median = N % 2 ? slopes[(N - 1) / 2] : (slopes[N / 2 - 1] + slopes[N / 2]) / 2;

  // Gilbert (1987) confidence interval on Sen's slope
  const zCrit = 1.959963984540054; // alpha = 0.05, two-sided
  const cAlpha = zCrit * Math.sqrt(varS);
  const m1 = Math.round((N - cAlpha) / 2);
  const m2 = Math.round((N + cAlpha) / 2);
  const lower = slopes[Math.max(0, Math.min(N - 1, m1 - 1))];
  const upper = slopes[Math.max(0, Math.min(N - 1, m2))];

  return {
    n,
    start: series[0].t,
    end: series[n - 1].t,
    S: s,
    varS,
    Z: z,
    pValue: p,
    kendallTau: tau,
    senSlope: median,
    senSlopeCI95: [lower, upper],
    significant: p < alpha,
    direction: p >= alpha ? 'no significant trend' : median > 0 ? 'increasing' : 'decreasing',
  };
}
