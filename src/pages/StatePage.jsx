import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ComposedChart, Area } from 'recharts';
import { Info, CloudRain, Waves, Thermometer, Layers, Wheat, Bug } from 'lucide-react';
import { Page, PageBanner } from '../components/Page';
import {
  REGIONS, regionById, climatology, monthlyFor, summary, soilFor, YEARS, CROPS, yieldSeries, colorOf, fmt, phLabel, textureClass, MONTHS,
  STATE_INFO, seasonalRain, rainAnomalies, extremes, yieldStats, CROP_CALENDAR,
} from '../lib/data';
import { DISEASES, scoreDisease } from '../lib/risk';
import { ChartTip, Legend } from '../components/ui';

const axis = { tickLine: false, axisLine: false };

export default function StatePage() {
  const { id } = useParams();
  const region = regionById[id] || REGIONS[0];
  return <StateBody key={region.id} region={region} />;
}

function StateBody({ region }) {
  const s = summary(region.id);
  const info = STATE_INFO[region.id];
  return (
    <Page>
      <PageBanner photo="cropRows" crumb={`States / ${region.name}`} title={region.name}>
        {info.zone}. {info.note}
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <nav className="state-picker" aria-label="Choose a state" data-stagger>
            {REGIONS.map((r) => (
              <NavLink key={r.id} to={`/states/${r.id}`} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="dot" style={{ background: colorOf(r.id) }} />
                {r.name}
              </NavLink>
            ))}
          </nav>
          <div className="facts" data-stagger>
            <Fact value={s.annualRain} unit="mm" label="Average yearly rainfall" />
            <Fact value={s.tMean} d={1} unit="°C" label="Average temperature" />
            <Fact value={s.humidity} unit="%" label="Average relative humidity" />
            <Fact value={s.soil.ph} d={1} unit="pH" label={`Topsoil, ${phLabel(s.soil.ph).toLowerCase()}`} />
          </div>
          <p className="state-meta" style={{ marginTop: -24, marginBottom: 36 }}>
            Weather measured near {region.station} ({region.lat.toFixed(2)}° N, {region.lon.toFixed(2)}° E, {fmt(region.elevation)} m above sea level).
            Main crops: {info.crops.join(', ')}.
          </p>
          <Insights region={region} />
          <div data-reveal><Climate region={region} /></div>
          <div className="grid-2" style={{ marginTop: 20 }}>
            <div data-reveal="left"><Soil region={region} /></div>
            <div data-reveal="right"><Yields region={region} /></div>
          </div>
          <div data-reveal><CropCalendar /></div>
          <div data-reveal><RiskCalendar region={region} /></div>
        </div>
      </div>
    </Page>
  );
}

function Insights({ region }) {
  const seas = seasonalRain(region.id);
  const clim = climatology(region.id);
  const wet = clim.reduce((a, b) => (b.rainfall > a.rainfall ? b : a));
  const an = rainAnomalies(region.id);
  const wettestY = an.reduce((a, b) => (b.pct > a.pct ? b : a));
  const driestY = an.reduce((a, b) => (b.pct < a.pct ? b : a));
  const ex = extremes(region.id);
  const soil = soilFor(region.id);
  const yieldBest = Object.keys(CROPS)
    .map((k) => ({ k, st: yieldStats(region.id, k) }))
    .filter((x) => x.st && x.st.vsIndia != null)
    .sort((a, b) => b.st.vsIndia - a.st.vsIndia)[0];
  let risk = { score: -1 };
  for (const d of DISEASES) {
    for (const c of clim) {
      const r = scoreDisease(d, { temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall });
      if (r.score > risk.score) risk = { ...r, d, c };
    }
  }
  const items = [
    [CloudRain, 'Rain', <><b>{fmt(seas.monsoonPct)}%</b> of the yearly rain falls in June–September{seas.postPct > 30 ? <>, and <b>{fmt(seas.postPct)}%</b> in October–December</> : ''}. The wettest month is <b>{wet.month}</b>, averaging {fmt(wet.rainfall)} mm.</>],
    [Waves, 'Variability', <>The wettest year was <b>{wettestY.year}</b> ({wettestY.pct > 0 ? '+' : ''}{fmt(wettestY.pct)}%, {wettestY.category.toLowerCase()}) and the driest <b>{driestY.year}</b> ({fmt(driestY.pct)}%, {driestY.category.toLowerCase()}), against the 2015–2024 average.</>],
    [Thermometer, 'Heat', <><b>{ex.hottestMonth}</b> is the hottest month on average. The highest reading in ten years was <b>{fmt(ex.hottest.value, 1)} °C</b> in {ex.hottest.when}{ex.heatMonths ? <>, and {ex.heatMonths} months touched 45 °C</> : ''}.</>],
    [Layers, 'Soil', <>Topsoil is <b>{textureClass(soil.sand, soil.silt, soil.clay).toLowerCase()}</b> and {phLabel(soil.ph).toLowerCase()} (pH {fmt(soil.ph, 1)}), with {soil.organicCarbon < 5 ? 'low' : soil.organicCarbon <= 7.5 ? 'medium' : 'high'} organic carbon ({fmt(soil.organicCarbon, 1)} g/kg).</>],
    yieldBest && [Wheat, 'Yield', <>{CROPS[yieldBest.k].label} does best against the national average: <b>{fmt(yieldBest.st.last.value, yieldBest.k === 'sugarcane' ? 1 : 0)} {CROPS[yieldBest.k].unit}</b> in {yieldBest.st.last.year}, {yieldBest.st.vsIndia >= 0 ? `${fmt(yieldBest.st.vsIndia)}% above` : `${fmt(-yieldBest.st.vsIndia)}% below`} All India.</>],
    [Bug, 'Disease', <>Average weather is most favourable for <b>{risk.d.name.toLowerCase()}</b> in <b>{risk.c.month}</b>, with a score of {risk.score} ({risk.level.label.toLowerCase()}).</>],
  ].filter(Boolean);
  return (
    <section className="section" style={{ paddingTop: 0, marginBottom: 24 }}>
      <div className="section-head" data-reveal><h2>What stands out</h2></div>
      <ul className="insight-list" data-stagger>
        {items.map(([Icon, label, text]) => (
          <li key={label}><Icon aria-hidden="true" /><p><b>{label}.</b> {text}</p></li>
        ))}
      </ul>
    </section>
  );
}

const CAL = { s: ['sow', 'sowing'], g: ['grow', 'growing'], h: ['harvest', 'harvest'], x: ['', 'not in the field'] };

function CropCalendar() {
  return (
    <section className="panel" style={{ marginTop: 20 }} aria-labelledby="cc-h">
      <div className="chart-head">
        <div><h3 id="cc-h">Typical crop seasons</h3><p className="sub">All-India kharif and rabi calendar; exact weeks vary by state and variety</p></div>
        <div className="legend">
          <span><i style={{ background: 'color-mix(in srgb, var(--leaf) 55%, var(--surface))' }} />Sowing</span>
          <span><i style={{ background: 'color-mix(in srgb, var(--leaf) 28%, var(--surface))' }} />Growing</span>
          <span><i style={{ background: 'var(--wheat)' }} />Harvest</span>
        </div>
      </div>
      <div className="heat-wrap">
        <div className="crop-cal">
          <div />
          {MONTHS.map((m) => <div className="hd" key={m}>{m}</div>)}
          {CROP_CALENDAR.map((c) => (
            <div key={c.crop} style={{ display: 'contents' }}>
              <div className="rl">{c.crop}<small>{c.season}</small></div>
              {c.months.map((v, i) => <div key={MONTHS[i]} className={`c ${CAL[v][0]}`} title={`${c.crop}, ${MONTHS[i]}: ${CAL[v][1]}`} />)}
            </div>
          ))}
        </div>
      </div>
      <p className="note">Read this with the disease calendar below: a high score only matters in months when the crop is in the field.</p>
    </section>
  );
}

function Fact({ value, unit, label, d = 0 }) {
  return (
    <div className="fact">
      <div className="fact-value">
        <span data-count={value} data-decimals={d}>{fmt(value, d)}</span>
        <small>{unit}</small>
      </div>
      <div className="fact-label">{label}</div>
    </div>
  );
}

function Climate({ region }) {
  const [year, setYear] = useState('avg');
  const clim = climatology(region.id);
  const data = year === 'avg' ? clim : monthlyFor(region.id, year).map((m, i) => ({ ...m, avgRain: clim[i].rainfall }));
  const label = year === 'avg' ? `${YEARS[0]}–${YEARS[YEARS.length - 1]} average` : String(year);

  return (
    <section className="panel" aria-labelledby="climate-h">
      <div className="chart-head">
        <div>
          <h3 id="climate-h">Climate through the year</h3>
          <p className="sub">Monthly values, {label}</p>
        </div>
        <label className="field">
          <span>Show</span>
          <select className="select" value={year} onChange={(e) => setYear(e.target.value === 'avg' ? 'avg' : Number(e.target.value))}>
            <option value="avg">10-year average</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-3">
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Rainfall (mm)</h4>
          {year !== 'avg' && <Legend items={[{ label: String(year), color: 'var(--r5)' }, { label: '10-year average', color: 'var(--ink-3)', line: true }]} />}
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" {...axis} interval={1} />
              <YAxis {...axis} />
              <Tooltip content={<ChartTip unit="mm" names={{ rainfall: 'Rainfall', avgRain: '10-year average' }} />} />
              <Bar dataKey="rainfall" name="Rainfall" fill="var(--r5)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              {year !== 'avg' && <Line dataKey="avgRain" stroke="var(--ink-3)" strokeWidth={2} strokeDasharray="4 3" dot={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Temperature (°C)</h4>
          <Legend items={[{ label: 'Mean', color: 'var(--s2)', line: true }, { label: 'Month’s extremes', color: 'color-mix(in srgb, var(--s2) 25%, transparent)' }]} />
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data.map((d) => ({ ...d, range: [d.tMin, d.tMax] }))} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" {...axis} interval={1} />
              <YAxis {...axis} domain={[0, 50]} />
              <Tooltip content={<TempTip />} />
              <Area dataKey="range" stroke="none" fill="var(--s2)" fillOpacity={0.18} isAnimationActive={false} />
              <Line dataKey="tMean" stroke="var(--s2)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Relative humidity (%)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" {...axis} interval={1} />
              <YAxis {...axis} domain={[0, 100]} />
              <Tooltip content={<ChartTip unit="%" names={{ humidity: 'Humidity' }} />} />
              <Line dataKey="humidity" name="Humidity" stroke="var(--s3)" strokeWidth={2} dot={{ r: 3, fill: 'var(--s3)', stroke: 'var(--surface)', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="note">
        The shaded band runs from the lowest to the highest temperature recorded in each month. Source: NASA POWER, monthly point data.
      </p>
    </section>
  );
}

function TempTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tip">
      <div className="t">{label}</div>
      <div className="r"><span>Mean</span><b>{fmt(d.tMean, 1)} °C</b></div>
      <div className="r"><span>Highest</span><b>{fmt(d.tMax, 1)} °C</b></div>
      <div className="r"><span>Lowest</span><b>{fmt(d.tMin, 1)} °C</b></div>
    </div>
  );
}

function rate(v, lo, hi) {
  if (v == null) return '';
  return v < lo ? 'Low' : v <= hi ? 'Medium' : 'High';
}

function Soil({ region }) {
  const s = soilFor(region.id);
  const texture = textureClass(s.sand, s.silt, s.clay);
  const rows = [
    { name: 'Organic carbon', unit: 'g/kg', v: s.organicCarbon, max: 25, d: 1, note: rate(s.organicCarbon, 5, 7.5) },
    { name: 'Total nitrogen', unit: 'g/kg', v: s.nitrogen, max: 3, d: 2, note: '' },
    { name: 'Cation exchange capacity', unit: 'cmol(c)/kg', v: s.cec, max: 60, d: 1, note: rate(s.cec, 10, 25) },
    { name: 'Bulk density', unit: 'g/cm³', v: s.bulkDensity, max: 2, d: 2, note: '' },
  ];
  return (
    <section className="panel" aria-labelledby="soil-h">
      <h3 id="soil-h">Topsoil, 0–30 cm</h3>
      <p className="sub" style={{ marginBottom: 22 }}>Average of {s.samplePoints} sample locations in farmland</p>
      <div className="soil-rows">
        <div className="soil-row">
          <div className="name">pH<small>{phLabel(s.ph)}</small></div>
          <div>
            <div className="scale scale-ph" role="img" aria-label={`pH ${s.ph} on a scale from 4 to 10`}>
              <div className="mark" style={{ left: `${((s.ph - 4) / 6) * 100}%` }} />
            </div>
            <div className="scale-ticks"><span>4 acidic</span><span>7 neutral</span><span>10 alkaline</span></div>
          </div>
          <div className="val">{fmt(s.ph, 2)}</div>
        </div>
        {rows.map((r) => (
          <div className="soil-row" key={r.name}>
            <div className="name">{r.name}<small>{r.unit}</small></div>
            <div className="scale" role="img" aria-label={`${r.name} ${r.v} ${r.unit}`}>
              <div style={{ width: `${Math.min(100, (r.v / r.max) * 100)}%`, height: '100%', borderRadius: 5, background: 'var(--s7)' }} />
            </div>
            <div className="val">{fmt(r.v, r.d)}{r.note && <small>{r.note}</small>}</div>
          </div>
        ))}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="name" style={{ fontWeight: 600, fontSize: '0.94rem' }}>Texture: {texture}</span>
            <span className="sub">sand / silt / clay %</span>
          </div>
          <div className="texture-bar" role="img" aria-label={`Sand ${s.sand}%, silt ${s.silt}%, clay ${s.clay}%`}>
            <div style={{ flex: s.sand, background: '#c49a5a' }}>{fmt(s.sand)}%</div>
            <div style={{ flex: s.silt, background: '#8a7a64' }}>{fmt(s.silt)}%</div>
            <div style={{ flex: s.clay, background: '#5a4636' }}>{fmt(s.clay)}%</div>
          </div>
          <div className="legend" style={{ marginTop: 8 }}>
            <span><i style={{ background: '#c49a5a' }} />Sand</span>
            <span><i style={{ background: '#8a7a64' }} />Silt</span>
            <span><i style={{ background: '#5a4636' }} />Clay</span>
          </div>
        </div>
      </div>
      <p className="note">
        Source: ISRIC SoilGrids 2.0, 250 m modelled estimates. Organic-carbon and CEC ratings use common Indian soil-testing bands. Texture class follows the USDA triangle.
      </p>
    </section>
  );
}

function Yields({ region }) {
  const [crop, setCrop] = useState('rice');
  const data = yieldSeries(crop, [region.id, 'india']);
  const has = data.some((d) => d[region.id] != null);
  const unit = CROPS[crop].unit;
  return (
    <section className="panel" aria-labelledby="yield-h">
      <h3 id="yield-h">Crop yield</h3>
      <p className="sub" style={{ marginBottom: 14 }}>{unit}, 2013-14 to 2022-23</p>
      <div className="seg" role="group" aria-label="Crop" style={{ marginBottom: 14 }}>
        {Object.entries(CROPS).map(([k, c]) => (
          <button key={k} aria-pressed={crop === k} onClick={() => setCrop(k)}>{c.label}</button>
        ))}
      </div>
      {has ? (
        <>
          <Legend items={[{ label: region.name, color: colorOf(region.id), line: true }, { label: 'All India', color: 'var(--india)', line: true }]} />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 12, right: 8, left: -6, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" {...axis} tickFormatter={(y) => y.slice(2)} />
              <YAxis {...axis} width={52} tickFormatter={(v) => fmt(v)} />
              <Tooltip content={<ChartTip unit={unit} digits={crop === 'sugarcane' ? 1 : 0} names={{ [region.id]: region.name, india: 'All India' }} />} />
              <Line dataKey="india" stroke="var(--india)" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
              <Line dataKey={region.id} stroke={colorOf(region.id)} strokeWidth={2.5} dot={{ r: 3.5, fill: colorOf(region.id), stroke: 'var(--surface)', strokeWidth: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="callout" style={{ marginTop: 20 }}>
          <Info aria-hidden="true" />
          <span>No official {CROPS[crop].label.toLowerCase()} yield is published for {region.name}; the crop is not grown here at a reportable scale.</span>
        </div>
      )}
      <p className="note">
        2022-23 values are third advance estimates. Gaps mean the figure was not published. Source: Ministry of Agriculture and Farmers Welfare, via RBI Handbook of Statistics on Indian States (November 2023 edition).
      </p>
    </section>
  );
}

function RiskCalendar({ region }) {
  const clim = climatology(region.id);
  return (
    <section className="panel" aria-labelledby="cal-h" style={{ marginTop: 20 }}>
      <div className="chart-head">
        <div>
          <h3 id="cal-h">When the weather favours disease</h3>
          <p className="sub">Rule-based score from 0 to 100 using each month’s 10-year average temperature, humidity and rainfall</p>
        </div>
        <div className="legend">
          <span><i className="lv-good" />Low, under 25</span>
          <span><i className="lv-warning" />Moderate, 25–49</span>
          <span><i className="lv-serious" />High, 50–74</span>
          <span><i className="lv-critical" />Very high, 75+</span>
        </div>
      </div>
      <div className="heat-wrap">
        <div className="heat" role="table" aria-label={`Disease-favourable weather by month in ${region.name}`}>
          <div role="row" style={{ display: 'contents' }}>
            <div />
            {MONTHS.map((m) => <div className="hd" role="columnheader" key={m}>{m}</div>)}
          </div>
          {DISEASES.map((d) => (
            <div role="row" style={{ display: 'contents' }} key={d.id}>
              <div className="rl" role="rowheader">{d.name}<small>{d.crop}</small></div>
              {clim.map((c) => {
                const r = scoreDisease(d, { temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall });
                return (
                  <Link
                    role="cell"
                    key={c.month}
                    to={`/risk?state=${region.id}&month=${c.monthIndex}&disease=${d.id}`}
                    className={`cell lv-${r.level.key}`}
                    style={{ textDecoration: 'none' }}
                    title={`${d.name}, ${c.month}: ${r.score} (${r.level.label}). ${fmt(c.tMean, 1)} °C, ${c.humidity}% humidity, ${c.rainfall} mm rain`}
                  >
                    {r.score}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="note">
        <strong>The score shows weather suitability only.</strong> It does not know whether the crop is in the field that month, its variety or
        its growth stage. Select a cell to see how the score is worked out.
      </p>
    </section>
  );
}
