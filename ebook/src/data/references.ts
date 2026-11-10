export type Reference = { id: string; group: 'data' | 'method' | 'projection' | 'imagery'; text: string; url?: string }

export const references: Reference[] = [
  // ---- Observational data
  {
    id: 'power',
    group: 'data',
    text: 'NASA Langley Research Center POWER Project — monthly point data (T2M, PRECTOTCORR, GWETROOT, AOD_55). Data obtained from the NASA LaRC POWER Project, funded through the NASA Earth Science / Applied Science Program.',
    url: 'https://power.larc.nasa.gov/',
  },
  {
    id: 'merra2',
    group: 'data',
    text: 'Gelaro, R. et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). J. Climate 30, 5419–5454.',
    url: 'https://doi.org/10.1175/JCLI-D-16-0758.1',
  },
  {
    id: 'mod13q1',
    group: 'data',
    text: 'Didan, K. (2021). MODIS/Terra Vegetation Indices 16-Day L3 Global 250 m SIN Grid V061. NASA EOSDIS Land Processes DAAC.',
    url: 'https://doi.org/10.5067/MODIS/MOD13Q1.061',
  },
  {
    id: 'ornl',
    group: 'data',
    text: 'ORNL DAAC (2018). MODIS and VIIRS Land Products Global Subsetting and Visualization Tool. ORNL DAAC, Oak Ridge, Tennessee, USA.',
    url: 'https://doi.org/10.3334/ORNLDAAC/1379',
  },
  {
    id: 'co2',
    group: 'data',
    text: 'Lan, X., Tans, P. & Thoning, K. W. Trends in globally-averaged CO₂ determined from NOAA Global Monitoring Laboratory measurements; Mauna Loa annual means (NOAA GML and Scripps Institution of Oceanography).',
    url: 'https://gml.noaa.gov/ccgg/trends/',
  },
  {
    id: 'lsa',
    group: 'data',
    text: 'NOAA Laboratory for Satellite Altimetry — regional mean sea level, Bay of Bengal (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6 Michael Freilich). Altimetry data are provided by NOAA Laboratory for Satellite Altimetry.',
    url: 'https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/',
  },
  // ---- Methods
  { id: 'mann', group: 'method', text: 'Mann, H. B. (1945). Nonparametric tests against trend. Econometrica 13, 245–259.', url: 'https://doi.org/10.2307/1907187' },
  { id: 'kendall', group: 'method', text: 'Kendall, M. G. (1975). Rank Correlation Methods, 4th ed. Charles Griffin, London.' },
  { id: 'sen', group: 'method', text: 'Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall’s tau. J. Am. Stat. Assoc. 63, 1379–1389.', url: 'https://doi.org/10.1080/01621459.1968.10480934' },
  { id: 'gilbert', group: 'method', text: 'Gilbert, R. O. (1987). Statistical Methods for Environmental Pollution Monitoring. Van Nostrand Reinhold, New York (Sen’s slope confidence interval).' },
  // ---- Projections
  {
    id: 'ar6',
    group: 'projection',
    text: 'IPCC (2021). Summary for Policymakers. In: Climate Change 2021: The Physical Science Basis. Contribution of WGI to the Sixth Assessment Report. Cambridge University Press. Table SPM.1; §B.5.3.',
    url: 'https://www.ipcc.ch/report/ar6/wg1/',
  },
  {
    id: 'ar6ch9',
    group: 'projection',
    text: 'Fox-Kemper, B. et al. (2021). Ocean, Cryosphere and Sea Level Change. In: Climate Change 2021: The Physical Science Basis (AR6 WGI, Ch. 9), Table 9.9.',
    url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-9/',
  },
  {
    id: 'meinshausen',
    group: 'projection',
    text: 'Meinshausen, M. et al. (2020). The shared socio-economic pathway (SSP) greenhouse gas concentrations and their extensions to 2500. Geosci. Model Dev. 13, 3571–3605.',
    url: 'https://doi.org/10.5194/gmd-13-3571-2020',
  },
  // ---- Imagery and maps
  {
    id: 'gibs',
    group: 'imagery',
    text: 'Satellite imagery: NASA Global Imagery Browse Services (GIBS), part of NASA ESDIS — VIIRS Black Marble (2016), Blue Marble shaded relief and bathymetry, Suomi NPP VIIRS corrected reflectance (7 Nov 2017).',
    url: 'https://www.earthdata.nasa.gov/gibs',
  },
  {
    id: 'gistemp',
    group: 'imagery',
    text: 'GISTEMP Team. GISS Surface Temperature Analysis (GISTEMP), v4. NASA Goddard Institute for Space Studies; annual frames as visualised by NASA Scientific Visualization Studio.',
    url: 'https://data.giss.nasa.gov/gistemp/',
  },
  {
    id: 'ne',
    group: 'imagery',
    text: 'Boundaries and rivers: Natural Earth (public domain), 1:10 m, India point-of-view country boundaries.',
    url: 'https://www.naturalearthdata.com/',
  },
  {
    id: 'team',
    group: 'imagery',
    text: 'Past / present / future scenes and the NE-AR logo: conceptual illustrations by the NE-AR team. They are artistic visions, not photographs or data.',
  },
]
