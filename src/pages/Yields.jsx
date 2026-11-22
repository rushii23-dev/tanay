import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Page, PageBanner, Toc, InView, PhotoReveal } from '../components/Page';
import { SplitText } from '../components/Photo';
import { ChartTip } from '../components/ui';
import { REGIONS, regionById, colorOf, fmt, CROPS, yieldSeries, yieldStats, latestYield } from '../lib/data';

const axis = { tickLine: false, axisLine: false };

export default function Yields() {
  const [crop, setCrop] = useState('rice');
  const c = CROPS[crop];
  const d = crop === 'sugarcane' ? 1 : 0;
  const series = yieldSeries(crop, [...REGIONS.map((r) => r.id), 'india']);
  const max = Math.max(...series.flatMap((row) => REGIONS.map((r) => row[r.id] ?? 0)), 1);
  const stats = REGIONS.map((r) => ({ r, s: yieldStats(r.id, crop) }));

  return (
    <Page>
      <PageBanner photo="wheatSky" crumb="Crop yields" title="Ten years of harvests, state by state." wheat>
        Official yield figures from the Ministry of Agriculture and Farmers Welfare for six crop groups, from 2013-14 to 2022-23. Yield is
        the harvest per hectare, the clearest way to compare how productive farmland is.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={[['trends', 'Trends'], ['summary', 'Summary table'], ['leaders', 'Top states by crop']]} />

          <div className="toolbar" data-reveal style={{ position: 'sticky', top: 80, zIndex: 5, background: 'color-mix(in srgb, var(--paper) 92%, transparent)', padding: '10px 0', backdropFilter: 'blur(8px)' }}>
            <div className="seg" role="group" aria-label="Crop">
              {Object.entries(CROPS).map(([k, v]) => <button key={k} aria-pressed={crop === k} onClick={() => setCrop(k)}>{v.label}</button>)}
            </div>
            <span className="sub">Yields in {c.unit}. Dashed line: All India.</span>
          </div>

          <section className="section" id="trends" style={{ paddingTop: 12 }}>
            <div className="section-head" data-reveal>
              <div>
                <h2>{c.label} yield trends</h2>
                <p>Every state on the same scale, so you can compare both level and direction. Gaps are years with no published figure.</p>
              </div>
            </div>
            <div className="multiples" data-stagger>
              {REGIONS.map((r) => {
                const has = series.some((row) => row[r.id] != null);
                const last = latestYield(r.id, crop);
                return (
                  <div className="multiple" key={r.id}>
                    <h4>
                      <Link to={`/states/${r.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.name}</Link>
                      <span>{last ? `${fmt(last.value, d)} in ${last.year}` : 'Not grown'}</span>
                    </h4>
                    <InView height={130}>
                      {has ? (
                        <ResponsiveContainer width="100%" height={130}>
                          <LineChart data={series} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="year" {...axis} tickFormatter={(y) => y.slice(2)} interval={4} />
                            <YAxis hide domain={[0, Math.ceil(max * 1.05)]} />
                            <Tooltip content={<ChartTip unit={c.unit} digits={d} names={{ [r.id]: r.name, india: 'All India' }} />} />
                            <Line dataKey="india" stroke="var(--india)" strokeDasharray="4 3" strokeWidth={1.5} dot={false} connectNulls />
                            <Line dataKey={r.id} stroke={colorOf(r.id)} strokeWidth={2.5} dot={false} connectNulls activeDot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ height: 130, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontSize: '0.88rem', textAlign: 'center' }}>No official figure published</div>
                      )}
                    </InView>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="section" id="summary">
            <div className="section-head" data-reveal><h2>{c.label}: ten-year summary</h2></div>
            <div className="table-scroll" data-reveal>
              <table className="data">
                <thead>
                  <tr>
                    <th>State</th><th>First year</th><th>Latest year</th><th>Change</th><th>Best year</th><th>Weakest year</th><th>Latest vs All India</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(({ r, s }) => (
                    <tr key={r.id}>
                      <td><span className="state-cell"><span className="dot" style={{ background: colorOf(r.id) }} />{r.name}</span></td>
                      {s ? (
                        <>
                          <td>{fmt(s.first.value, d)} <span className="unit">{s.first.year}</span></td>
                          <td>{fmt(s.last.value, d)} <span className="unit">{s.last.year}{s.last.estimate ? '*' : ''}</span></td>
                          <td style={{ color: s.change >= 0 ? 'var(--good-ink)' : 'var(--critical-ink)', fontWeight: 650 }}>
                            {s.change >= 0 ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />} {s.change > 0 ? '+' : ''}{fmt(s.change)}%
                          </td>
                          <td>{fmt(s.best.value, d)} <span className="unit">{s.best.year}</span></td>
                          <td>{fmt(s.worst.value, d)} <span className="unit">{s.worst.year}</span></td>
                          <td>{s.vsIndia == null ? '—' : `${s.vsIndia > 0 ? '+' : ''}${fmt(s.vsIndia)}%`}</td>
                        </>
                      ) : <td colSpan={6} style={{ textAlign: 'left', color: 'var(--ink-3)' }}>Not grown at a reportable scale</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">* 2022-23 third advance estimates. Change compares the first and latest published years. {crop === 'wheat' && 'Maharashtra’s 2022-23 wheat figure is reproduced as published, though it is far above earlier years.'}</p>
          </section>

          <section className="section">
            <div className="photo-split">
              <PhotoReveal k="harvesting" height={480} />
              <div>
                <span className="kicker" data-reveal>What yield means</span>
                <h2 data-split style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}><SplitText text="Yield is the harvest per hectare of land." /></h2>
                <p data-reveal style={{ color: 'var(--ink-2)', fontSize: '1.05rem', marginTop: 16 }}>It is the fairest way to compare states of very different sizes: a state can grow a lot of rice simply because it has a lot of land, but a high yield means every hectare produces more. Irrigation, seed, soil and weather all show up in this one number.</p>
              </div>
            </div>
          </section>

          <section className="section" id="leaders">
            <div className="section-head" data-reveal>
              <div><h2>Top state for each crop</h2><p>Highest yield among the eight states in the latest published year.</p></div>
            </div>
            <div className="insights" data-stagger style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {Object.entries(CROPS).map(([k, v]) => {
                const best = REGIONS.map((r) => ({ r, y: latestYield(r.id, k) })).filter((x) => x.y).sort((a, b) => b.y.value - a.y.value)[0];
                const india = latestYield('india', k);
                const dd = k === 'sugarcane' ? 1 : 0;
                return (
                  <button key={k} className={`insight ${k === crop ? 'green' : ''}`} onClick={() => setCrop(k)} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
                    <span className="kicker" style={{ marginBottom: 0 }}><Trophy aria-hidden="true" />{v.label}</span>
                    <h3>{regionById[best.r.id].name}</h3>
                    <span className="big" style={{ fontSize: '2.2rem' }}>{fmt(best.y.value, dd)}<small>{v.unit}</small></span>
                    <p>{best.y.year}. All India: {fmt(india.value, dd)} {v.unit}.</p>
                  </button>
                );
              })}
            </div>
            <p className="note">Source: Ministry of Agriculture and Farmers Welfare, Government of India, via the RBI Handbook of Statistics on Indian States (November 2023 edition). <Link to="/sources">More about the data</Link></p>
          </section>
        </div>
      </div>
    </Page>
  );
}
