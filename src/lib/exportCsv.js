import Papa from 'papaparse';
import { WEATHER, SOIL, YIELDS, CROPS, regionById } from './data';

export const weatherCsv = () =>
  Papa.unparse(WEATHER.map((w) => ({
    region: regionById[w.region].name, date: w.date, temperature: w.tMean, tmax: w.tMax, tmin: w.tMin, humidity: w.humidity, rainfall: w.rainfall,
  })));

export const soilCsv = () =>
  Papa.unparse(SOIL.map((s) => ({
    region: regionById[s.region].name, ph: s.ph, organic_carbon: s.organicCarbon, nitrogen: s.nitrogen, cec: s.cec, bulk_density: s.bulkDensity,
    clay: s.clay, sand: s.sand, silt: s.silt,
  })));

export const yieldCsv = () =>
  Papa.unparse(YIELDS.filter((y) => y.region !== 'india').map((y) => ({
    region: regionById[y.region].name, year: y.year, crop: CROPS[y.crop].label, yield_kg_ha: y.yield,
  })));

/** Real Punjab 2023–24 weather with ten problems added on purpose, for practising the checks. */
export const practiceCsv = () => {
  const rows = WEATHER.filter((w) => w.region === 'punjab' && w.date >= '2023-01').map((w) => ({
    state: 'Punjab', month: w.date, temp_c: w.tMean, tmax: w.tMax, tmin: w.tMin, rh: w.humidity, rain_mm: w.rainfall,
  }));
  rows[2].rh = '';                          // missing value
  rows.splice(5, 0, { ...rows[4] });        // exact duplicate
  rows[8].month = '2023-13';                // invalid month
  rows[10].rain_mm = 'heavy';               // text in numeric column
  rows[12].rh = 140;                        // impossible humidity
  rows[14].state = 'Panjab';                // typo, fixed automatically
  rows[15].state = 'Haryana';               // unsupported region
  rows[17].month = 'May 2024';              // different date format, fixed automatically
  rows[19] = { ...rows[19], tmin: 41, tmax: 30 }; // min above max
  rows[21].state = '  punjab ';             // stray spaces and case
  return Papa.unparse(rows);
};

export function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
