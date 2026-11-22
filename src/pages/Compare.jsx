import { Page, PageBanner } from '../components/Page';
import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { REGIONS, regionById, climatology, annualRain, soilFor, CROPS, yieldSeries, latestYield, colorOf, fmt, summary } from '../lib/data';
import { ChartTip, Legend } from '../components/ui';

const axis = { tickLine: false, axisLine: false };

const METRICS = {
  rain: { label: 'Rainfall by month', group: 'Weather', unit: 'mm', kind: 'monthly', key: 'rainfall' },
  temp: { label: 'Temperature by month', group: 'Weather', unit: '°C', kind: 'monthly', key: 'tMean', digits: 1 },
  hum: { label: 'Humidity by month', group: 'Weather', unit: '%', kind: 'monthly', key: 'humidity' },
  annual: { label: 'Yearly rainfall', group: 'Weather', unit: 'mm', kind: 'annual' },
  yield: { label: 'Crop yield over time', group: 'Yield', kind: 'yield' },
  soil: { label: 'Soil properties', group: 'Soil', kind: 'soil' },
};

const SOIL_PROPS = {
  ph: { label: 'pH', unit: '', d: 2 },
  organicCarbon: { label: 'Organic carbon', unit: 'g/kg', d: 1 },
  nitrogen: { label: 'Total nitrogen', unit: 'g/kg', d: 2 },
  clay: { label: 'Clay', unit: '%', d: 1 },
  sand: { label: 'Sand', unit: '%', d: 1 },
  cec: { label: 'Cation exchange capacity', unit: 'cmol(c)/kg', d: 1 },
};

export default function Compare() {
  const [selected, setSelected] = useState(['punjab', 'west-bengal', 'tamil-nadu', 'gujarat']);
  const [metric, setMetric] = useState('rain');
  const [crop, setCrop] = useState('rice');
  const [prop, setProp] = useState('ph');
  const m = METRICS[metric];
  const ids = REGIONS.map((r) => r.id).filter((id) => selected.includes(id));

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const series = useMemo(() => {
    if (m.kind === 'monthly') {
      const c = Object.fromEntries(REGIONS.map((r) => [r.id, climatology(r.id)]));
      return c[REGIONS[0].id].map((row, i) => {
        const o = { x: row.month };
        for (const r of REGIONS) o[r.id] = c[r.id][i][m.key];
        return o;
      });
    }
    if (m.kind === 'annual') {
      const a = Object.fromEntries(REGIONS.map((r) => [r.id, annualRain(r.id)]));
      return a[REGIONS[0].id].map((row, i) => {
        const o = { x: String(row.year) };
        for (const r of REGIONS) o[r.id] = a[r.id][i].rainfall;
        return o;
      });
    }
    if (m.kind === 'yield') return yieldSeries(crop, REGIONS.map((r) => r.id)).map((r) => ({ ...r, x: r.year }));
    return [];
  }, [m, crop]);

  const unit = m.kind === 'yield' ? CROPS[crop].unit : m.unit;
  const digits = m.kind === 'yield' && crop === 'sugarcane' ? 1 : m.digits || 0;

  // ranking used beside the chart
  const ranking = useMemo(() => {
    let rows;
    if (m.kind === 'soil') rows = ids.map((id) => ({ id, v: soilFor(id)[prop] }));
    else if (m.kind === 'yield') rows = ids.map((id) => ({ id, v: latestYield(id, crop)?.value ?? null }));
    else if (m.kind === 'annual' || metric === 'rain') rows = ids.map((id) => ({ id, v: summary(id).annualRain }));
    else rows = ids.map((id) => ({ id, v: summary(id)[metric === 'temp' ? 'tMean' : 'humidity'] }));
    return rows.sort((a, b) => (b.v ?? -1) - (a.v ?? -1));
  }, [ids, m, metric, crop, prop]);
  const maxV = Math.max(...ranking.map((r) => r.v ?? 0), 1);

  const rankTitle = {
    rain: 'Total rainfall in an average year', temp: 'Average temperature', hum: 'Average humidity', annual: 'Average yearly rainfall',
    yield: `Latest ${CROPS[crop].label.toLowerCase()} yield`, soil: SOIL_PROPS[prop].label,
  }[metric];
  const rankUnit = m.kind === 'soil' ? SOIL_PROPS[prop].unit : m.kind === 'yield' ? CROPS[crop].unit : m.unit;
  const rankDigits = m.kind === 'soil' ? SOIL_PROPS[prop].d : digits;

  return (
    <Page>
      <PageBanner photo="lushField" crumb="Compare" title="Put the states side by side.">
        Choose any mix of the eight states and a measure: monthly rainfall, temperature or humidity, yearly rainfall, soil properties or ten years of crop yields. Each state keeps the same colour on every chart.
      </PageBanner>
      <div className="page-body">
      <div className="wrap">
        <header className="page-head">
          <h1>Compare states</h1>
          <p>Choose the states and the measure you want to compare. Each state keeps the same colour on every chart.</p>
        </header>

        <div className="toolbar">
          <label className="field">
            <span>Measure</span>
            <select className="select" value={metric} onChange={(e) => setMetric(e.target.value)}>
              {['Weather', 'Yield', 'Soil'].map((g) => (
                <optgroup key={g} label={g}>
                  {Object.entries(METRICS).filter(([, v]) => v.group === g).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          {m.kind === 'yield' && (
            <label className="field">
              <span>Crop</span>
              <select className="select" value={crop} onChange={(e) => setCrop(e.target.value)}>
                {Object.entries(CROPS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
              </select>
            </label>
          )}
          {m.kind === 'soil' && (
            <label className="field">
              <span>Property</span>
              <select className="select" value={prop} onChange={(e) => setProp(e.target.value)}>
                {Object.entries(SOIL_PROPS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div className="chips" role="group" aria-label="States to compare" style={{ marginBottom: 24 }}>
          {REGIONS.map((r) => (
            <button key={r.id} className="chip" aria-pressed={selected.includes(r.id)} onClick={() => toggle(r.id)}>
              <span className="dot" style={{ background: colorOf(r.id) }} />
              {r.name}
            </button>
          ))}
          <button className="linkish" style={{ marginLeft: 8, fontSize: '0.88rem' }} onClick={() => setSelected(selected.length === REGIONS.length ? [] : REGIONS.map((r) => r.id))}>
            {selected.length === REGIONS.length ? 'Clear all' : 'Select all'}
          </button>
        </div>

        {ids.length === 0 ? (
          <div className="panel"><p>Select at least one state above to start comparing.</p></div>
        ) : (
          <div className={m.kind === 'soil' ? '' : 'grid-compare'}>
            {m.kind !== 'soil' && (
              <section data-reveal className="panel">
                <div className="chart-head">
                  <div>
                    <h3>{m.kind === 'yield' ? `${CROPS[crop].label} yield` : m.label}</h3>
                    <p className="sub">
                      {unit}
                      {m.kind === 'monthly' && ', 10-year average for each month'}
                      {m.kind === 'yield' && ', 2013-14 to 2022-23'}
                    </p>
                  </div>
                </div>
                <Legend items={ids.map((id) => ({ label: regionById[id].name, color: colorOf(id), line: true }))} />
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={series} margin={{ top: 16, right: 12, left: -4, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="x" {...axis} tickFormatter={(v) => (m.kind === 'yield' ? v.slice(2) : v)} />
                    <YAxis {...axis} width={54} tickFormatter={(v) => fmt(v)} />
                    <Tooltip content={<ChartTip unit={unit} digits={digits} names={Object.fromEntries(REGIONS.map((r) => [r.id, r.name]))} />} />
                    {ids.map((id) => (
                      <Line key={id} dataKey={id} stroke={colorOf(id)} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </section>
            )}
            <section data-reveal className="panel" style={m.kind === 'soil' ? {} : { marginTop: 0 }}>
              <h3>{rankTitle}</h3>
              <p className="sub" style={{ marginBottom: 18 }}>
                {rankUnit || 'pH units'}, highest first
                {m.kind === 'yield' && '. Latest published year'}
              </p>
              <div data-grow className="rank">
                {ranking.map((r) => (
                  <div className="rank-row" key={r.id}>
                    <span className="state-cell" style={{ fontWeight: 500 }}><span className="dot" style={{ background: colorOf(r.id) }} />{regionById[r.id].name}</span>
                    {r.v == null ? <span className="sub">Not grown</span> : (
                      <div className="bar" style={{ width: `${(r.v / maxV) * 100}%`, background: colorOf(r.id) }} />
                    )}
                    <span className="v">{r.v == null ? '—' : fmt(r.v, rankDigits)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        <p className="note">
          Weather: NASA POWER, 2015–2024, one representative location per state. Soil: ISRIC SoilGrids 2.0, 0–30 cm. Yields: Ministry of
          Agriculture and Farmers Welfare via the RBI Handbook of Statistics on Indian States; 2022-23 figures are third advance estimates.
        </p>
      </div>
      </div>
    </Page>
  );
}
