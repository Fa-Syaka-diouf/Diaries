// Future-scenario values shown on page 4.
//
// These are NOT computed by this project. They are the published, assessed
// global projections of the IPCC Sixth Assessment Report (AR6, Working Group I),
// which synthesise CMIP6 model output with observational constraints. They are
// global means; they are not local projections for the four study sites.
//
// Sources
//  - Warming: IPCC AR6 WGI Summary for Policymakers, Table SPM.1
//    (change in global surface temperature relative to 1850–1900).
//  - Sea level: IPCC AR6 WGI SPM B.5.3 and Table 9.9 (global mean sea-level
//    rise in 2100 relative to 1995–2014, likely range).
//  - CO₂ concentrations in 2100: scenario inputs from Meinshausen et al. (2020),
//    Geosci. Model Dev. 13, 3571–3605 (SSP greenhouse-gas concentrations).

export type Scenario = 'SSP1-2.6' | 'SSP2-4.5' | 'SSP3-7.0'

export const scenarioInfo: Record<Scenario, { label: string; color: string; description: string }> = {
  'SSP1-2.6': { label: 'Low emissions', color: '#4C956C', description: 'CO₂ emissions decline to net zero around or after 2050.' },
  'SSP2-4.5': { label: 'Intermediate', color: '#D99A2B', description: 'CO₂ emissions stay around current levels until mid-century.' },
  'SSP3-7.0': { label: 'High emissions', color: '#C8553D', description: 'CO₂ emissions roughly double from current levels by 2100.' },
}

/** Global surface temperature change vs 1850–1900, °C: best estimate and very likely (5–95 %) range. */
export const warming: Record<Scenario, { period: string; best: number; range: [number, number] }[]> = {
  'SSP1-2.6': [
    { period: '2041–2060', best: 1.7, range: [1.3, 2.2] },
    { period: '2081–2100', best: 1.8, range: [1.3, 2.4] },
  ],
  'SSP2-4.5': [
    { period: '2041–2060', best: 2.0, range: [1.6, 2.5] },
    { period: '2081–2100', best: 2.7, range: [2.1, 3.5] },
  ],
  'SSP3-7.0': [
    { period: '2041–2060', best: 2.1, range: [1.7, 2.6] },
    { period: '2081–2100', best: 3.6, range: [2.8, 4.6] },
  ],
}

/** Global mean sea-level rise in 2100 vs 1995–2014, metres: median and likely (17–83 %) range. */
export const seaLevel2100: Record<Scenario, { median: number; range: [number, number] }> = {
  'SSP1-2.6': { median: 0.44, range: [0.32, 0.62] },
  'SSP2-4.5': { median: 0.56, range: [0.44, 0.76] },
  'SSP3-7.0': { median: 0.68, range: [0.55, 0.9] },
}

/** Prescribed atmospheric CO₂ in 2100 (ppm), rounded. */
export const co2In2100: Record<Scenario, number> = {
  'SSP1-2.6': 446,
  'SSP2-4.5': 603,
  'SSP3-7.0': 867,
}

export const scenarios: Scenario[] = ['SSP1-2.6', 'SSP2-4.5', 'SSP3-7.0']
