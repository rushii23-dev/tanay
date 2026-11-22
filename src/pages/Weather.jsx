import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Thermometer, Droplets, CloudRain, Sun, Snowflake, Flame } from 'lucide-react';
import { Page, PageBanner, Toc, InView, PhotoReveal } from '../components/Page';
import { SplitText } from '../components/Photo';
import {
  REGIONS, regionById, colorOf, fmt, SEASONS, seasonalRain, rainAnomalies, extremes, climatology, MONTHS, rainCv, YEARS, summary,
} from '../lib/data';

const axis = { tickLine: false, axisLine: false };

function heatColor(v, min, max, base) {
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
  return `color-mix(in srgb, ${base} ${Math.round(8 + t * 84)}%, var(--surface))`;
}

function HeatGrid({ metric, unit, base, min, max, digits = 0, label }) {
  return (
    <div className="heat-wrap">
      <div className="heat" role="table" aria-label={label} style={{ gridTemplateColumns: '140px repeat(12, minmax(0, 1fr))' }}>
        <div role="row" style={{ display: 'contents' }}>
          <div />
          {MONTHS.map((m) => <div className="hd" role="columnheader" key={m}>{m}</div>)}
        </div>
        {REGIONS.map((r) => (
          <div role="row" style={{ display: 'contents' }} key={r.id}>
            <div className="rl" role="rowheader">{r.name}</div>
            {climatology(r.id).map((c) => {
              const v = c[metric];
              const t = (v - min) / (max - min);
              return (
                <div role="cell" key={c.month} className="cell" title={`${r.name}, ${c.month}: ${fmt(v, digits)} ${unit}`}
                  style={{ background: heatColor(v, min, max, base), color: t > 0.6 ? '#fff' : 'var(--ink)', fontWeight: 600 }}>
                  {fmt(v, digits)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Weather() {
  const [state, setState] = useState('maharashtra');
  const anomalies = rainAnomalies(state);
  const seasons = REGIONS.map((r) => ({ r, s: seasonalRain(r.id) })).sort((a, b) => b.s.monsoonPct - a.s.monsoonPct);

  return (
    <Page>
      <PageBanner photo="monsoon" crumb="Weather" title="The weather behind every season.">
        Ten years of monthly temperature, humidity and rainfall for eight states, from NASA POWER. See when the rain comes, how much it
        changes from year to year, and how hot and humid each state gets.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={[['seasons', 'Rain by season'], ['years', 'Year to year'], ['temperature', 'Temperature'], ['humidity', 'Humidity'], ['meaning', 'Why it matters']]} />

          <section className="section" id="seasons">
            <div className="section-head" data-reveal>
              <div>
                <h2>When the rain falls</h2>
                <p>Share of each state’s average yearly rain by season, using the India Meteorological Department’s four seasons. Sorted by dependence on the south-west monsoon.</p>
              </div>
            </div>
            <div className="panel" data-reveal>
              <div className="legend" style={{ marginBottom: 18 }}>
                {SEASONS.map((s) => <span key={s.id}><i style={{ background: s.color }} />{s.label}, {s.span}</span>)}
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                {seasons.map(({ r, s }) => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 80px', gap: 14, alignItems: 'center' }}>
                    <Link to={`/states/${r.id}`} style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', fontSize: '0.93rem' }}>{r.name}</Link>
                    <div style={{ display: 'flex', gap: 2, height: 30 }} role="img"
                      aria-label={`${r.name}: ${SEASONS.map((x) => `${x.label} ${Math.round(s[`${x.id}Pct`])}%`).join(', ')}`}>
                      {SEASONS.map((x, i) => (
                        <div key={x.id} title={`${x.label}: ${fmt(s[x.id])} mm (${fmt(s[`${x.id}Pct`])}%)`}
                          style={{ flex: s[x.id], background: x.color, borderRadius: i === 0 ? '6px 0 0 6px' : i === 3 ? '0 6px 6px 0' : 0, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '0.78rem', fontWeight: 650, minWidth: 0, overflow: 'hidden' }}>
                          {s[`${x.id}Pct`] >= 8 ? `${Math.round(s[`${x.id}Pct`])}%` : ''}
                        </div>
                      ))}
                    </div>
                    <span style={{ textAlign: 'right', fontWeight: 650 }}>{fmt(s.total)}<small style={{ color: 'var(--ink-3)', fontWeight: 400 }}> mm</small></span>
                  </div>
                ))}
              </div>
              <p className="note">Tamil Nadu stands apart: its wettest season is October–December, when the north-east monsoon arrives. Every other state gets most of its rain from June to September.</p>
            </div>
          </section>

          <section className="section" id="years">
            <div className="section-head" data-reveal>
              <div>
                <h2>Good years and bad years</h2>
                <p>Each year’s rainfall compared with the state’s own 2015–2024 average. The categories follow the India Meteorological Department’s bands for departure from normal.</p>
              </div>
              <label className="field">
                <span>State</span>
                <select className="select" value={state} onChange={(e) => setState(e.target.value)}>
                  {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            </div>
            <div className="grid-compare">
              <div className="panel" data-reveal>
                <h3>{regionById[state].name}: departure from average</h3>
                <p className="sub" style={{ marginBottom: 12 }}>% above or below the {fmt(summary(state).annualRain)} mm average</p>
                <InView height={300}>
                  <ResponsiveContainer width="100%" height={300} key={state}>
                    <BarChart data={anomalies} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="year" {...axis} />
                      <YAxis {...axis} tickFormatter={(v) => `${v}%`} />
                      <ReferenceLine y={0} stroke="var(--line-strong)" />
                      <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={({ active, payload }) => active && payload?.length ? (
                        <div className="chart-tip">
                          <div className="t">{payload[0].payload.year}</div>
                          <div className="r"><span>Rainfall</span><b>{fmt(payload[0].payload.rainfall)} mm</b></div>
                          <div className="r"><span>Departure</span><b>{payload[0].payload.pct > 0 ? '+' : ''}{fmt(payload[0].payload.pct, 1)}%</b></div>
                          <div className="r"><span>Category</span><b>{payload[0].payload.category}</b></div>
                        </div>) : null} />
                      <Bar dataKey="pct" radius={[4, 4, 4, 4]} maxBarSize={36}>
                        {anomalies.map((a) => <Cell key={a.year} fill={a.pct >= 0 ? 'var(--s1)' : 'var(--soil)'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </InView>
                <div className="legend" style={{ marginTop: 8 }}>
                  <span><i style={{ background: 'var(--s1)' }} />Wetter than average</span>
                  <span><i style={{ background: 'var(--soil)' }} />Drier than average</span>
                </div>
              </div>
              <div className="panel" data-reveal="right" style={{ marginTop: 0 }}>
                <h3>Rainfall reliability</h3>
                <p className="sub" style={{ marginBottom: 18 }}>Year-to-year variation (coefficient of variation). Lower means more dependable rain.</p>
                <div data-grow className="rank">
                  {[...REGIONS].map((r) => ({ r, v: rainCv(r.id) })).sort((a, b) => a.v - b.v).map(({ r, v }) => (
                    <div className="rank-row" key={r.id}>
                      <span className="state-cell" style={{ fontWeight: r.id === state ? 700 : 500 }}><span className="dot" style={{ background: colorOf(r.id) }} />{r.name}</span>
                      <div className="bar" style={{ width: `${(v / 40) * 100}%`, background: colorOf(r.id) }} />
                      <span className="v">{fmt(v)}%</span>
                    </div>
                  ))}
                </div>
                <h3 style={{ marginTop: 26, fontSize: '1rem' }}>{regionById[state].name}, year by year</h3>
                <table className="data compact" style={{ marginTop: 8 }}>
                  <tbody>
                    {anomalies.map((a) => (
                      <tr key={a.year}><td>{a.year}</td><td>{fmt(a.rainfall)} mm</td><td>{a.pct > 0 ? '+' : ''}{fmt(a.pct)}%</td><td style={{ textAlign: 'left' }}>{a.category}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="section" id="temperature">
            <div className="section-head" data-reveal>
              <div>
                <h2>Heat and cold</h2>
                <p>Average temperature for every month ({YEARS[0]}–{YEARS[YEARS.length - 1]}), and the most extreme readings recorded in the ten years.</p>
              </div>
            </div>
            <div className="panel" data-reveal>
              <h3 style={{ marginBottom: 14 }}>Monthly mean temperature, °C</h3>
              <HeatGrid metric="tMean" unit="°C" base="var(--s2)" min={10} max={36} digits={0} label="Monthly mean temperature by state" />
            </div>
            <div className="table-scroll" style={{ marginTop: 20 }} data-reveal>
              <table className="data">
                <thead>
                  <tr>
                    <th>State</th><th>Hottest month</th><th>Coolest month</th>
                    <th><Flame size={14} aria-hidden="true" /> Highest reading</th><th><Snowflake size={14} aria-hidden="true" /> Lowest reading</th>
                    <th>Months reaching 45 °C</th><th><CloudRain size={14} aria-hidden="true" /> Wettest month on record</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((r) => {
                    const e = extremes(r.id);
                    return (
                      <tr key={r.id}>
                        <td><span className="state-cell"><span className="dot" style={{ background: colorOf(r.id) }} />{r.name}</span></td>
                        <td>{e.hottestMonth}</td><td>{e.coolestMonth}</td>
                        <td>{fmt(e.hottest.value, 1)} °C <span className="unit">{e.hottest.when}</span></td>
                        <td>{fmt(e.coldest.value, 1)} °C <span className="unit">{e.coldest.when}</span></td>
                        <td>{e.heatMonths}</td>
                        <td>{fmt(e.wettest.value)} mm <span className="unit">{e.wettest.when}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="humidity">
            <div className="section-head" data-reveal>
              <div>
                <h2>How humid it gets</h2>
                <p>Average relative humidity at 2 metres for each month. Long humid spells keep leaves wet, which many crop diseases need.</p>
              </div>
            </div>
            <div className="panel" data-reveal>
              <h3 style={{ marginBottom: 14 }}>Monthly relative humidity, %</h3>
              <HeatGrid metric="humidity" unit="%" base="var(--s3)" min={20} max={90} label="Monthly relative humidity by state" />
            </div>
          </section>

          <section className="section">
            <div className="photo-split flip">
              <PhotoReveal k="rainPlanting" height={480} />
              <div>
                <span className="kicker" data-reveal>The monsoon calendar</span>
                <h2 data-split style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}><SplitText text="When the rain comes, the planting begins." /></h2>
                <p data-reveal style={{ color: 'var(--ink-2)', fontSize: '1.05rem', marginTop: 16 }}>Most kharif crops are sown as soon as the south-west monsoon has wetted the soil. A late or weak monsoon shifts the whole season, and a very wet one raises the risk of bacterial and fungal disease. That is why this page looks at seasons and year-to-year swings, not just yearly totals.</p>
              </div>
            </div>
          </section>

          <section className="section" id="meaning">
            <div className="section-head" data-reveal><h2>Why these numbers matter to a farmer</h2></div>
            <div className="explain" data-stagger>
              <div><h4><CloudRain aria-hidden="true" />Rainfall</h4><p>Sets sowing dates for rain-fed kharif crops. Too little delays sowing; too much at harvest damages grain and spreads bacterial disease.</p></div>
              <div><h4><Thermometer aria-hidden="true" />Temperature</h4><p>Drives crop growth and the speed of a disease cycle. Wheat needs a cool winter; heat above about 35 °C during grain filling cuts yields.</p></div>
              <div><h4><Droplets aria-hidden="true" />Humidity</h4><p>High humidity keeps leaves wet for longer, which lets fungal spores germinate. Most leaf diseases rise with humidity.</p></div>
              <div><h4><Sun aria-hidden="true" />Seasons</h4><p>Kharif crops are sown with the June monsoon; rabi crops grow on stored soil moisture and irrigation through the cool, dry winter.</p></div>
            </div>
            <p className="note">Values are NASA POWER monthly data for one representative farming location per state (MERRA-2 reanalysis, about 50 km grid). They can differ from IMD rain-gauge totals. <Link to="/sources">More about the data</Link></p>
          </section>
        </div>
      </div>
    </Page>
  );
}
