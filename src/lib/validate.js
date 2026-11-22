// CSV validation and cleaning for weather, soil and crop-yield datasets.
import { REGIONS } from './data';

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Column aliases → canonical field
const ALIASES = {
  region: ['region', 'state', 'statename', 'stateut', 'location', 'district'],
  date: ['date', 'month', 'yearmonth', 'period', 'obsdate', 'datetime'],
  year: ['year', 'cropyear', 'season', 'agriyear'],
  crop: ['crop', 'cropname', 'commodity'],
  yield: ['yield', 'yieldkgha', 'yieldkgperha', 'yieldkgperhectare', 'productivity'],
  temperature: ['temperature', 'temp', 'tmean', 't2m', 'avgtemp', 'meantemp', 'temperaturec', 'tempc'],
  tMax: ['tmax', 'maxtemp', 't2mmax', 'temperaturemax'],
  tMin: ['tmin', 'mintemp', 't2mmin', 'temperaturemin'],
  humidity: ['humidity', 'rh', 'rh2m', 'relativehumidity', 'humiditypct'],
  rainfall: ['rainfall', 'rain', 'precipitation', 'precip', 'rainfallmm', 'rainmm', 'precipmm', 'precipitationmm', 'prectotcorr', 'prectotcorrsum'],
  ph: ['ph', 'soilph', 'phh2o'],
  organicCarbon: ['organiccarbon', 'oc', 'soc', 'carbon'],
  nitrogen: ['nitrogen', 'n', 'totaln', 'totalnitrogen'],
  phosphorus: ['phosphorus', 'p'],
  potassium: ['potassium', 'k'],
  clay: ['clay', 'claypct'],
  sand: ['sand', 'sandpct'],
  silt: ['silt', 'siltpct'],
};

export const SCHEMAS = {
  weather: {
    label: 'Weather',
    required: ['region', 'date', 'temperature', 'humidity', 'rainfall'],
    optional: ['tMax', 'tMin'],
    key: ['region', 'date'],
  },
  soil: {
    label: 'Soil',
    required: ['region', 'ph'],
    optional: ['organicCarbon', 'nitrogen', 'phosphorus', 'potassium', 'clay', 'sand', 'silt'],
    key: null,
  },
  yield: {
    label: 'Crop yield',
    required: ['region', 'year', 'crop', 'yield'],
    optional: [],
    key: ['region', 'year', 'crop'],
  },
};

// Valid range [errorMin, errorMax] and plausible range [warnMin, warnMax]
const RANGES = {
  temperature: { hard: [-30, 60], soft: [-5, 48], unit: '°C' },
  tMax: { hard: [-30, 60], soft: [-5, 52], unit: '°C' },
  tMin: { hard: [-40, 50], soft: [-10, 35], unit: '°C' },
  humidity: { hard: [0, 100], soft: [5, 100], unit: '%' },
  rainfall: { hard: [0, 5000], soft: [0, 2500], unit: 'mm' },
  ph: { hard: [0, 14], soft: [3.5, 10], unit: '' },
  organicCarbon: { hard: [0, 600], soft: [0, 150], unit: 'g/kg' },
  nitrogen: { hard: [0, 2000], soft: [0, 1000], unit: '' },
  phosphorus: { hard: [0, 2000], soft: [0, 500], unit: '' },
  potassium: { hard: [0, 5000], soft: [0, 2000], unit: '' },
  clay: { hard: [0, 100], soft: [0, 100], unit: '%' },
  sand: { hard: [0, 100], soft: [0, 100], unit: '%' },
  silt: { hard: [0, 100], soft: [0, 100], unit: '%' },
  yield: { hard: [0, 200000], soft: [50, 150000], unit: 'kg/ha' },
};

const REGION_ALIASES = {
  punjab: 'punjab', pb: 'punjab', panjab: 'punjab',
  uttarpradesh: 'uttar-pradesh', up: 'uttar-pradesh',
  maharashtra: 'maharashtra', mh: 'maharashtra',
  karnataka: 'karnataka', ka: 'karnataka',
  tamilnadu: 'tamil-nadu', tn: 'tamil-nadu',
  westbengal: 'west-bengal', wb: 'west-bengal',
  gujarat: 'gujarat', gj: 'gujarat',
  madhyapradesh: 'madhya-pradesh', mp: 'madhya-pradesh',
  allindia: 'india', india: 'india',
};
const regionName = Object.fromEntries(REGIONS.map((r) => [r.id, r.name]));
regionName.india = 'All India';

export function mapColumns(headers) {
  const map = {};
  headers.forEach((h) => {
    const n = norm(h);
    for (const [field, al] of Object.entries(ALIASES)) {
      if (!map[field] && al.includes(n)) { map[field] = h; break; }
    }
  });
  return map;
}

export function detectType(headers) {
  const map = mapColumns(headers);
  let best = null;
  for (const [type, s] of Object.entries(SCHEMAS)) {
    const hit = s.required.filter((f) => map[f]).length / s.required.length;
    const extra = s.optional.filter((f) => map[f]).length * 0.01;
    if (!best || hit + extra > best.score) best = { type, score: hit + extra };
  }
  return { type: best.type, map };
}

function parseNumber(v) {
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/,/g, '');
  if (s === '') return null;
  return /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(s) ? Number(s) : NaN;
}

const pad = (n) => String(n).padStart(2, '0');
function validDate(y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
/** Returns {value, fixed} with value 'YYYY-MM' or 'YYYY-MM-DD', or null if invalid. */
export function parseDate(raw) {
  const s = String(raw ?? '').trim();
  let m;
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})$/))) {
    const [y, mo] = [+m[1], +m[2]];
    return mo >= 1 && mo <= 12 ? { value: `${y}-${pad(mo)}`, fixed: s !== `${y}-${pad(mo)}` } : null;
  }
  if ((m = s.match(/^(\d{4})(\d{2})$/))) {
    const [y, mo] = [+m[1], +m[2]];
    return mo >= 1 && mo <= 12 ? { value: `${y}-${pad(mo)}`, fixed: true } : null;
  }
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/))) {
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    return validDate(y, mo, d) ? { value: `${y}-${pad(mo)}-${pad(d)}`, fixed: s !== `${y}-${pad(mo)}-${pad(d)}` } : null;
  }
  if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) {
    const [d, mo, y] = [+m[1], +m[2], +m[3]];
    return validDate(y, mo, d) ? { value: `${y}-${pad(mo)}-${pad(d)}`, fixed: true } : null;
  }
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if ((m = s.match(/^([a-z]{3})[a-z]*[\s-]+(\d{4})$/i))) {
    const mo = months.indexOf(m[1].toLowerCase()) + 1;
    return mo ? { value: `${m[2]}-${pad(mo)}`, fixed: true } : null;
  }
  return null;
}
export function parseYear(raw) {
  const s = String(raw ?? '').trim();
  let m;
  if ((m = s.match(/^(\d{4})\s*[-–/]\s*(\d{2}|\d{4})$/))) {
    const a = +m[1];
    const b = m[2].length === 2 ? +(`${String(a).slice(0, 2)}${m[2]}`) : +m[2];
    return b === a + 1 ? { value: `${a}-${String(b).slice(2)}`, fixed: s !== `${a}-${String(b).slice(2)}` } : null;
  }
  if ((m = s.match(/^(\d{4})$/))) return { value: m[1], fixed: false };
  return null;
}

/**
 * Validate parsed CSV rows.
 * Issue severities: "error" (row is excluded from the cleaned file), "warning" (kept, needs a look),
 * "fixed" (normalised automatically in the cleaned file).
 */
export function validate(rows, headers, forcedType) {
  const detected = detectType(headers);
  const type = forcedType || detected.type;
  const map = detected.map;
  const schema = SCHEMAS[type];
  const issues = [];
  const add = (row, column, severity, kind, message, value) => issues.push({ row, column, severity, kind, message, value });

  const missingCols = schema.required.filter((f) => !map[f]);
  const fields = [...schema.required, ...schema.optional].filter((f) => map[f]);
  const unmapped = headers.filter((h) => !Object.values(map).includes(h) || !fields.some((f) => map[f] === h));

  const seenExact = new Map();
  const seenKey = new Map();
  const clean = [];
  const cellFlags = {}; // `${rowIdx}:${header}` -> 'bad' | 'warn'
  const currentYear = new Date().getFullYear();

  rows.forEach((raw, i) => {
    const rowNo = i + 2; // +1 header line, +1 for 1-based numbering
    let rowError = false;
    const out = {};
    const flag = (h, f) => { cellFlags[`${i}:${h}`] = f; };

    const cells = headers.map((h) => String(raw[h] ?? '').trim());
    const exact = JSON.stringify(cells);
    if (cells.every((c) => c === '')) {
      add(rowNo, '', 'error', 'empty', 'Empty row', '');
      return;
    }
    if (seenExact.has(exact)) {
      add(rowNo, '', 'error', 'duplicate', `Exact duplicate of row ${seenExact.get(exact)}`, '');
      return;
    }
    seenExact.set(exact, rowNo);

    for (const f of fields) {
      const h = map[f];
      const v = raw[h];
      const s = String(v ?? '').trim();
      if (s !== String(v ?? '') && s !== '') add(rowNo, h, 'fixed', 'whitespace', 'Extra spaces removed', v);

      if (s === '' || ['na', 'n/a', 'null', 'nan', '-', '--'].includes(s.toLowerCase())) {
        if (schema.required.includes(f)) {
          add(rowNo, h, 'error', 'missing', 'Required value is missing', s);
          flag(h, 'bad');
          rowError = true;
        } else out[f] = null;
        continue;
      }

      if (f === 'region') {
        const id = REGION_ALIASES[norm(s)];
        if (!id) {
          add(rowNo, h, 'error', 'region', `“${s}” is not one of the eight supported states`, s);
          flag(h, 'bad');
          rowError = true;
        } else {
          if (regionName[id] !== s) add(rowNo, h, 'fixed', 'format', `Region name standardised to “${regionName[id]}”`, s);
          out.region = regionName[id];
        }
      } else if (f === 'date') {
        const d = parseDate(s);
        if (!d) {
          add(rowNo, h, 'error', 'date', `“${s}” is not a valid date`, s);
          flag(h, 'bad');
          rowError = true;
        } else {
          if (Number(d.value.slice(0, 4)) > currentYear || Number(d.value.slice(0, 4)) < 1900) {
            add(rowNo, h, 'warning', 'date', `Year ${d.value.slice(0, 4)} is outside the expected range`, s);
            flag(h, 'warn');
          }
          if (d.fixed) add(rowNo, h, 'fixed', 'format', `Date rewritten as ${d.value}`, s);
          out.date = d.value;
        }
      } else if (f === 'year') {
        const y = parseYear(s);
        if (!y) {
          add(rowNo, h, 'error', 'date', `“${s}” is not a valid year (use 2021 or 2021-22)`, s);
          flag(h, 'bad');
          rowError = true;
        } else {
          if (y.fixed) add(rowNo, h, 'fixed', 'format', `Year rewritten as ${y.value}`, s);
          out.year = y.value;
        }
      } else if (f === 'crop') {
        out.crop = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        if (out.crop !== s) add(rowNo, h, 'fixed', 'format', `Crop name standardised to “${out.crop}”`, s);
      } else {
        const n = parseNumber(s);
        if (Number.isNaN(n)) {
          add(rowNo, h, 'error', 'type', `“${s}” is not a number`, s);
          flag(h, 'bad');
          rowError = true;
          continue;
        }
        const r = RANGES[f];
        if (r && (n < r.hard[0] || n > r.hard[1])) {
          add(rowNo, h, 'error', 'range', `${n}${r.unit ? ' ' + r.unit : ''} is impossible (allowed ${r.hard[0]} to ${r.hard[1]})`, s);
          flag(h, 'bad');
          rowError = true;
        } else if (r && (n < r.soft[0] || n > r.soft[1])) {
          add(rowNo, h, 'warning', 'range', `${n}${r.unit ? ' ' + r.unit : ''} is unusual (expected ${r.soft[0]} to ${r.soft[1]})`, s);
          flag(h, 'warn');
        }
        out[f] = n;
      }
    }

    if (!rowError && type === 'weather' && out.tMax != null && out.tMin != null && out.tMin > out.tMax) {
      add(rowNo, map.tMin, 'error', 'logic', `Minimum temperature (${out.tMin}) is above the maximum (${out.tMax})`, '');
      flag(map.tMin, 'bad');
      rowError = true;
    }
    if (!rowError && type === 'soil' && out.sand != null && out.silt != null && out.clay != null) {
      const t = out.sand + out.silt + out.clay;
      if (Math.abs(t - 100) > 2) add(rowNo, map.sand, 'warning', 'logic', `Sand + silt + clay adds up to ${t.toFixed(1)}%, not 100%`, '');
    }

    if (!rowError && schema.key) {
      const k = schema.key.map((f) => out[f]).join('|');
      if (seenKey.has(k)) {
        add(rowNo, '', 'error', 'conflict', `Same ${schema.key.join(' + ')} as row ${seenKey.get(k)} but different values`, '');
        rowError = true;
      } else seenKey.set(k, rowNo);
    }

    if (!rowError) clean.push(out);
  });

  // Dataset-level checks
  const datasetNotes = [];
  if (type === 'weather' && clean.length >= 5) {
    const temps = clean.map((r) => r.temperature).filter((x) => x != null).sort((a, b) => a - b);
    const median = temps[Math.floor(temps.length / 2)];
    if (median > 45) datasetNotes.push('Temperatures look like they are in °F. Convert them to °C before analysis.');
    const rh = clean.map((r) => r.humidity).filter((x) => x != null);
    if (rh.length && Math.max(...rh) <= 1) datasetNotes.push('Humidity looks like a fraction (0–1). Multiply by 100 to get percent.');
  }

  const counts = { error: 0, warning: 0, fixed: 0 };
  issues.forEach((x) => counts[x.severity]++);
  const byKind = {};
  issues.forEach((x) => { if (x.severity !== 'fixed') byKind[x.kind] = (byKind[x.kind] || 0) + 1; });

  return {
    type,
    detectedType: detected.type,
    map,
    fields,
    missingCols,
    unmapped,
    rowCount: rows.length,
    validCount: clean.length,
    issues,
    counts,
    byKind,
    cellFlags,
    clean,
    datasetNotes,
    quality: rows.length ? Math.round((clean.length / rows.length) * 100) : 0,
  };
}

export const KIND_LABEL = {
  missing: 'Missing values',
  duplicate: 'Duplicate rows',
  conflict: 'Conflicting records',
  date: 'Invalid dates',
  type: 'Not a number',
  range: 'Out of range',
  region: 'Unknown region',
  logic: 'Inconsistent values',
  empty: 'Empty rows',
};
