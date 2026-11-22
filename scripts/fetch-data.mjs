// Fetches real public data: NASA POWER monthly weather (2015-2024) and ISRIC SoilGrids v2 soil properties.
import { writeFileSync } from 'node:fs';
const OUT = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const regions = [
  { id: 'punjab', name: 'Punjab', station: 'Ludhiana', pts: [[30.80, 75.60], [30.15, 74.95], [30.30, 76.45]] },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', station: 'Lucknow', pts: [[26.70, 80.70], [29.10, 77.80], [26.60, 83.00]] },
  { id: 'maharashtra', name: 'Maharashtra', station: 'Aurangabad', pts: [[19.80, 75.50], [20.70, 77.10], [17.75, 75.70]] },
  { id: 'karnataka', name: 'Karnataka', station: 'Dharwad', pts: [[15.40, 75.10], [16.10, 77.20], [12.50, 76.80]] },
  { id: 'tamil-nadu', name: 'Tamil Nadu', station: 'Thanjavur', pts: [[10.70, 79.20], [11.00, 77.20], [9.95, 78.00]] },
  { id: 'west-bengal', name: 'West Bengal', station: 'Bardhaman', pts: [[23.30, 87.80], [23.40, 88.50], [22.95, 88.10]] },
  { id: 'gujarat', name: 'Gujarat', station: 'Anand', pts: [[22.50, 72.90], [22.20, 70.90], [23.60, 72.40]] },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', station: 'Bhopal', pts: [[23.10, 77.50], [22.60, 75.70], [23.10, 79.90]] },
];

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
      console.error('HTTP', r.status, url);
    } catch (e) { console.error('ERR', e.message); }
    await sleep(15000);
  }
  return null;
}

const result = { fetchedAt: new Date().toISOString(), regions: [] };
for (const reg of regions) {
  const [lat, lon] = reg.pts[0];
  const w = await getJson(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR_SUM&community=AG&longitude=${lon}&latitude=${lat}&start=2015&end=2024&format=JSON`);
  const soils = [];
  for (const [la, lo] of reg.pts) {
    const s = await getJson(`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lo}&lat=${la}&property=phh2o&property=soc&property=nitrogen&property=clay&property=sand&property=silt&property=cec&property=bdod&depth=0-5cm&depth=5-15cm&depth=15-30cm&value=mean`);
    soils.push({ lat: la, lon: lo, data: s?.properties?.layers ?? null });
    await sleep(13000);
  }
  result.regions.push({ ...reg, weather: w?.properties?.parameter ?? null, elevation: w?.geometry?.coordinates?.[2], soils });
  console.log('done', reg.name, !!w, soils.map((s) => !!s.data));
  writeFileSync(OUT, JSON.stringify(result));
}
console.log('ALL DONE');
