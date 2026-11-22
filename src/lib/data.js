import regions from '../data/regions.json';
import weather from '../data/weather.json';
import soil from '../data/soil.json';
import yields from '../data/yields.json';
import meta from '../data/meta.json';

export const REGIONS = regions;
export const META = meta;
export const regionById = Object.fromEntries(regions.map((r) => [r.id, r]));
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const YEARS = [...new Set(weather.map((w) => Number(w.date.slice(0, 4))))].sort();
export const WEATHER = weather;
export const SOIL = soil;
export const YIELDS = yields;

/** Categorical colour slot for a state (fixed order, never re-assigned when filtering). */
export const colorOf = (id) => `var(--s${regions.findIndex((r) => r.id === id) + 1})`;

const avg = (xs) => {
  const v = xs.filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const sum = (xs) => xs.filter((x) => x != null).reduce((a, b) => a + b, 0);
export const round = (v, d = 0) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d);

const byRegion = {};
for (const w of weather) (byRegion[w.region] ||= []).push(w);
export const weatherFor = (id) => byRegion[id] || [];

/** 10-year monthly averages (climatology) for one state. */
const climCache = {};
export function climatology(id) {
  if (climCache[id]) return climCache[id];
  const rows = weatherFor(id);
  climCache[id] = MONTHS.map((m, i) => {
    const sel = rows.filter((r) => Number(r.date.slice(5, 7)) === i + 1);
    return {
      month: m,
      monthIndex: i,
      tMean: round(avg(sel.map((r) => r.tMean)), 1),
      tMax: round(avg(sel.map((r) => r.tMax)), 1),
      tMin: round(avg(sel.map((r) => r.tMin)), 1),
      humidity: round(avg(sel.map((r) => r.humidity)), 0),
      rainfall: round(avg(sel.map((r) => r.rainfall)), 0),
    };
  });
  return climCache[id];
}

export function monthlyFor(id, year) {
  return MONTHS.map((m, i) => {
    const r = weatherFor(id).find((w) => w.date === `${year}-${String(i + 1).padStart(2, '0')}`);
    return { month: m, ...r };
  });
}

export function annualRain(id) {
  return YEARS.map((y) => ({ year: y, rainfall: round(sum(weatherFor(id).filter((r) => r.date.startsWith(String(y))).map((r) => r.rainfall)), 0) }));
}

export const soilFor = (id) => soil.find((s) => s.region === id);

export const CROPS = {
  rice: { label: 'Rice', unit: 'kg/ha', scale: 1 },
  wheat: { label: 'Wheat', unit: 'kg/ha', scale: 1 },
  coarseCereals: { label: 'Coarse cereals', unit: 'kg/ha', scale: 1 },
  pulses: { label: 'Pulses', unit: 'kg/ha', scale: 1 },
  oilseeds: { label: 'Oilseeds', unit: 'kg/ha', scale: 1 },
  sugarcane: { label: 'Sugarcane', unit: 't/ha', scale: 0.001 },
};
export const YIELD_YEARS = [...new Set(yields.map((y) => y.year))].sort();

export function yieldValue(region, crop, year) {
  const r = yields.find((y) => y.region === region && y.crop === crop && y.year === year);
  return r ? { value: round(r.yield * CROPS[crop].scale, crop === 'sugarcane' ? 1 : 0), estimate: r.estimate } : null;
}
export function yieldSeries(crop, ids) {
  return YIELD_YEARS.map((year) => {
    const row = { year };
    for (const id of ids) row[id] = yieldValue(id, crop, year)?.value ?? null;
    return row;
  });
}
export function latestYield(region, crop) {
  for (let i = YIELD_YEARS.length - 1; i >= 0; i--) {
    const v = yieldValue(region, crop, YIELD_YEARS[i]);
    if (v) return { year: YIELD_YEARS[i], ...v };
  }
  return null;
}

export function summary(id) {
  const rows = weatherFor(id);
  const ann = annualRain(id);
  return {
    annualRain: round(avg(ann.map((a) => a.rainfall)), 0),
    tMean: round(avg(rows.map((r) => r.tMean)), 1),
    humidity: round(avg(rows.map((r) => r.humidity)), 0),
    wettestMonth: climatology(id).reduce((a, b) => (b.rainfall > a.rainfall ? b : a)).month,
    soil: soilFor(id),
  };
}

/** USDA soil texture class from sand / silt / clay percentages. */
export function textureClass(sand, silt, clay) {
  if (sand == null || silt == null || clay == null) return '—';
  const t = sand + silt + clay;
  sand = (sand / t) * 100; silt = (silt / t) * 100; clay = (clay / t) * 100;
  if (clay >= 40 && silt < 40 && sand <= 45) return 'Clay';
  if (clay >= 40 && silt >= 40) return 'Silty clay';
  if (clay >= 35 && sand > 45) return 'Sandy clay';
  if (clay >= 27 && clay < 40 && sand <= 20) return 'Silty clay loam';
  if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) return 'Clay loam';
  if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) return 'Sandy clay loam';
  if (silt >= 80 && clay < 12) return 'Silt';
  if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) return 'Silt loam';
  if (clay >= 7 && clay < 27 && silt >= 28 && silt < 50 && sand <= 52) return 'Loam';
  if (silt + 1.5 * clay < 15) return 'Sand';
  if (silt + 1.5 * clay >= 15 && silt + 2 * clay < 30) return 'Loamy sand';
  return 'Sandy loam';
}

export function phLabel(ph) {
  if (ph == null) return '—';
  if (ph < 5.5) return 'Strongly acidic';
  if (ph < 6.5) return 'Slightly acidic';
  if (ph <= 7.5) return 'Neutral';
  if (ph <= 8.5) return 'Moderately alkaline';
  return 'Strongly alkaline';
}

export const fmt = (v, d = 0) => (v == null ? '—' : Number(v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }));

// ---------- derived insights (all computed from the bundled data) ----------

export const SEASONS = [
  { id: 'winter', label: 'Winter', months: [0, 1], span: 'Jan–Feb', color: 'var(--s1)' },
  { id: 'pre', label: 'Pre-monsoon', months: [2, 3, 4], span: 'Mar–May', color: 'var(--s2)' },
  { id: 'monsoon', label: 'South-west monsoon', months: [5, 6, 7, 8], span: 'Jun–Sep', color: 'var(--s3)' },
  { id: 'post', label: 'Post-monsoon', months: [9, 10, 11], span: 'Oct–Dec', color: 'var(--s4)' },
];

export function seasonalRain(id) {
  const c = climatology(id);
  const total = c.reduce((a, b) => a + b.rainfall, 0);
  const out = { total };
  for (const s of SEASONS) {
    const v = s.months.reduce((a, m) => a + c[m].rainfall, 0);
    out[s.id] = v;
    out[`${s.id}Pct`] = total ? (v / total) * 100 : 0;
  }
  return out;
}

/** IMD-style departure categories for yearly rainfall against the 10-year mean of this dataset. */
export function rainCategory(pct) {
  if (pct >= 60) return 'Large excess';
  if (pct >= 20) return 'Excess';
  if (pct > -20) return 'Normal';
  if (pct > -60) return 'Deficient';
  return 'Large deficient';
}
export function rainAnomalies(id) {
  const a = annualRain(id);
  const mean = a.reduce((s, x) => s + x.rainfall, 0) / a.length;
  return a.map((x) => {
    const pct = ((x.rainfall - mean) / mean) * 100;
    return { year: String(x.year), rainfall: x.rainfall, pct: round(pct, 1), category: rainCategory(pct) };
  });
}

export function extremes(id) {
  const rows = weatherFor(id);
  const hot = rows.reduce((a, b) => (b.tMax > a.tMax ? b : a));
  const cold = rows.reduce((a, b) => (b.tMin < a.tMin ? b : a));
  const wet = rows.reduce((a, b) => (b.rainfall > a.rainfall ? b : a));
  const label = (d) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
  return {
    hottest: { value: hot.tMax, when: label(hot.date) },
    coldest: { value: cold.tMin, when: label(cold.date) },
    wettest: { value: wet.rainfall, when: label(wet.date) },
    heatMonths: rows.filter((r) => r.tMax >= 45).length,
    hottestMonth: climatology(id).reduce((a, b) => (b.tMean > a.tMean ? b : a)).month,
    coolestMonth: climatology(id).reduce((a, b) => (b.tMean < a.tMean ? b : a)).month,
    humidMonth: climatology(id).reduce((a, b) => (b.humidity > a.humidity ? b : a)).month,
  };
}

export function rainCv(id) {
  const a = annualRain(id).map((x) => x.rainfall);
  const m = a.reduce((s, x) => s + x, 0) / a.length;
  const sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
  return (sd / m) * 100;
}

export function yieldStats(region, crop) {
  const pts = YIELD_YEARS.map((y) => ({ year: y, ...(yieldValue(region, crop, y) || {}) })).filter((p) => p.value != null);
  if (!pts.length) return null;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const best = pts.reduce((a, b) => (b.value > a.value ? b : a));
  const worst = pts.reduce((a, b) => (b.value < a.value ? b : a));
  const india = latestYield('india', crop);
  return {
    first, last, best, worst, count: pts.length,
    change: ((last.value - first.value) / first.value) * 100,
    vsIndia: india ? ((last.value - (yieldValue('india', crop, last.year)?.value ?? india.value)) / (yieldValue('india', crop, last.year)?.value ?? india.value)) * 100 : null,
  };
}

/** Background facts used in descriptive text (qualitative, widely documented). */
export const STATE_INFO = {
  punjab: { zone: 'Trans-Gangetic plains', crops: ['Wheat', 'Rice', 'Cotton', 'Maize'], note: 'Intensively irrigated by canals and tube wells, with a rice–wheat rotation on most farmland.' },
  'uttar-pradesh': { zone: 'Upper and middle Gangetic plains', crops: ['Wheat', 'Sugarcane', 'Rice', 'Potato'], note: 'India’s largest producer of wheat and sugarcane, farmed on deep alluvial soils.' },
  maharashtra: { zone: 'Deccan plateau', crops: ['Cotton', 'Soybean', 'Sugarcane', 'Pulses'], note: 'Black cotton soils over basalt; much of the farmland depends on monsoon rain.' },
  karnataka: { zone: 'Southern plateau', crops: ['Ragi', 'Maize', 'Rice', 'Coffee'], note: 'A mix of rain-fed dryland and irrigated farming; India’s leading coffee producer.' },
  'tamil-nadu': { zone: 'East coast plains', crops: ['Rice', 'Sugarcane', 'Banana', 'Groundnut'], note: 'Gets most of its rain from the north-east monsoon in October–December; the Cauvery delta is its rice bowl.' },
  'west-bengal': { zone: 'Lower Gangetic plains', crops: ['Rice', 'Jute', 'Potato', 'Tea'], note: 'One of India’s largest rice and potato producers and the main jute-growing state.' },
  gujarat: { zone: 'Western semi-arid plains', crops: ['Cotton', 'Groundnut', 'Wheat', 'Castor'], note: 'A leading producer of cotton and groundnut, with long dry seasons outside the monsoon.' },
  'madhya-pradesh': { zone: 'Central highlands', crops: ['Soybean', 'Wheat', 'Gram', 'Pulses'], note: 'Known as India’s soybean state, with black soils on the Malwa plateau.' },
};

/** Typical all-India crop seasons (exact dates vary by state). 's' sow, 'g' growing, 'h' harvest. */
export const CROP_CALENDAR = [
  { crop: 'Rice', season: 'Kharif', months: ['x', 'x', 'x', 'x', 'x', 's', 's', 'g', 'g', 'h', 'h', 'x'] },
  { crop: 'Maize', season: 'Kharif', months: ['x', 'x', 'x', 'x', 'x', 's', 's', 'g', 'h', 'h', 'x', 'x'] },
  { crop: 'Cotton', season: 'Kharif', months: ['x', 'x', 'x', 'x', 's', 's', 'g', 'g', 'g', 'h', 'h', 'h'] },
  { crop: 'Wheat', season: 'Rabi', months: ['g', 'g', 'h', 'h', 'x', 'x', 'x', 'x', 'x', 'x', 's', 's'] },
  { crop: 'Gram', season: 'Rabi', months: ['g', 'g', 'h', 'x', 'x', 'x', 'x', 'x', 'x', 's', 's', 'g'] },
  { crop: 'Mustard', season: 'Rabi', months: ['g', 'h', 'h', 'x', 'x', 'x', 'x', 'x', 'x', 's', 'g', 'g'] },
];
