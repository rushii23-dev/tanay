import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea } from 'recharts';
import { Code2, Database, BarChart3, ShieldCheck, Workflow } from 'lucide-react';
import { Page, PageBanner, Toc, InView } from '../components/Page';
import { DISEASES, tempSuit, humSuit, rainSuit } from '../lib/risk';
import { fmt, WEATHER, SOIL, YIELDS } from '../lib/data';

const axis = { tickLine: false, axisLine: false };

function Curves() {
  const [id, setId] = useState('rice-blast');
  const d = DISEASES.find((x) => x.id === id);
  const t = Array.from({ length: 46 }, (_, i) => ({ x: i, v: tempSuit(i, d.temp) }));
  const h = Array.from({ length: 101 }, (_, i) => ({ x: i, v: humSuit(i, d.hum) }));
  const r = Array.from({ length: 61 }, (_, i) => ({ x: i * 5, v: rainSuit(i * 5, d.rain) }));
  const chart = (data, unit, name, band) => (
    <div>
      <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>{name}</h4>
      <InView height={180}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" {...axis} type="number" domain={['dataMin', 'dataMax']} tickFormatter={(v) => `${v}${unit}`} />
            <YAxis {...axis} domain={[0, 1]} ticks={[0, 0.5, 1]} />
            {band && <ReferenceArea x1={band[0]} x2={band[1]} fill="var(--wheat)" fillOpacity={0.18} />}
            <Tooltip content={({ active, payload }) => (active && payload?.length ? (
              <div className="chart-tip"><div className="t">{payload[0].payload.x}{unit}</div><div className="r"><span>Fit</span><b>{fmt(payload[0].value, 2)}</b></div></div>
            ) : null)} />
            <Area type="linear" dataKey="v" stroke="var(--indigo)" strokeWidth={2} fill="var(--indigo)" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </InView>
    </div>
  );
  return (
    <div className="panel" data-reveal>
      <div className="chart-head">
        <div><h3>How each factor is scored</h3><p className="sub">Fit from 0 to 1 for {d.name.toLowerCase()}. The shaded band is the ideal temperature range.</p></div>
        <select className="select" value={id} onChange={(e) => setId(e.target.value)} aria-label="Disease">
          {DISEASES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="grid-3" key={id}>
        {chart(t, ' °C', 'Temperature fit', [d.temp[1], d.temp[2]])}
        {chart(h, '%', 'Humidity fit')}
        {chart(r, ' mm', 'Rainfall fit')}
      </div>
    </div>
  );
}

export default function Method() {
  return (
    <Page>
      <PageBanner photo="seedlings" crumb="How it works" title="From raw files to a risk score.">
        The full pipeline behind CropShield AI: how data is collected, checked, combined, shown and turned into a preliminary disease-risk
        score. Every step can be repeated from the scripts in the project.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={[['pipeline', 'Pipeline'], ['integration', 'Integration'], ['risk', 'Risk score'], ['stack', 'Technology']]} />

          <section className="section" id="pipeline">
            <div className="section-head" data-reveal><h2>The pipeline</h2></div>
            <ol className="steps" data-stagger>
              <li><div>
                <h3>Collect</h3>
                <p>Three public sources, each fetched by a script so the download can be repeated.</p>
                <ul>
                  <li>NASA POWER monthly API: temperature (mean, highest, lowest), relative humidity and corrected precipitation, 2015–2024.</li>
                  <li>ISRIC SoilGrids REST API: eight soil properties at three depths for three farmland points per state.</li>
                  <li>RBI Handbook of Statistics on Indian States: state-wise yield tables from the Ministry of Agriculture.</li>
                </ul>
              </div></li>
              <li><div>
                <h3>Validate</h3>
                <p>The same rules used on the <Link to="/validate">Check a dataset</Link> page: required columns, missing values, duplicates, conflicting records, invalid dates, non-numeric values, impossible and unusual ranges, unknown regions, inconsistent values and unit mix-ups.</p>
              </div></li>
              <li><div>
                <h3>Clean and standardise</h3>
                <ul>
                  <li>API fill values (−999) become empty values; nothing is invented or interpolated.</li>
                  <li>Dates become YYYY-MM, crop years YYYY-YY, and state names one standard spelling.</li>
                  <li>Units are converted: SoilGrids integers to pH, g/kg and %; sugarcane yield from kg/ha to t/ha.</li>
                </ul>
              </div></li>
              <li><div>
                <h3>Integrate</h3>
                <p>Datasets are joined on state, with month for weather and crop year for yields. Weather is summarised into 10-year monthly averages, seasonal totals and yearly totals so it can sit beside soil and yield figures.</p>
              </div></li>
              <li><div>
                <h3>Visualise</h3>
                <p>Charts follow one set of rules: one colour per state that never changes, a single y-axis per chart, quiet grids, tooltips on every mark and units on every axis.</p>
              </div></li>
              <li><div>
                <h3>Assess disease risk</h3>
                <p>A rule-based score compares average weather with the favourable ranges of six diseases, explained below.</p>
              </div></li>
            </ol>
          </section>

          <section className="section" id="integration">
            <div className="section-head" data-reveal>
              <div>
                <h2>Why combine weather, soil and yield</h2>
                <p>No single dataset explains a harvest. Weather sets the season and the disease pressure, soil sets how much water and nutrient a crop can draw on, and yield records the outcome. Joined on state and time, they can be read together.</p>
              </div>
            </div>
            <div className="table-scroll" data-reveal>
              <table className="data">
                <thead><tr><th>Dataset</th><th>Grain</th><th>Join key</th><th>Summaries used</th><th>Records</th></tr></thead>
                <tbody>
                  <tr><td>Weather</td><td>Monthly, one point per state</td><td>State + YYYY-MM</td><td>Monthly means, seasonal and yearly totals, extremes</td><td>{fmt(WEATHER.length)}</td></tr>
                  <tr><td>Soil</td><td>Static, 0–30 cm</td><td>State</td><td>Depth-weighted mean of 2–3 points</td><td>{SOIL.length}</td></tr>
                  <tr><td>Crop yield</td><td>Yearly, state total</td><td>State + crop year + crop</td><td>Trend, change, best and weakest year</td><td>{fmt(YIELDS.length)}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="risk">
            <div className="section-head" data-reveal>
              <div>
                <h2>The disease-risk score</h2>
                <p>Three fits between 0 and 1 are combined into a score from 0 to 100. Temperature multiplies everything, because none of these diseases develops outside its temperature range, however wet it is.</p>
              </div>
            </div>
            <div className="panel" data-reveal style={{ marginBottom: 20, fontSize: '1.15rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              score = 100 × temperature fit × (w₁ × humidity fit + w₂ × rainfall fit)
            </div>
            <Curves />
            <div className="table-scroll" style={{ marginTop: 20 }} data-reveal>
              <table className="data compact">
                <thead><tr><th className="left">Disease</th><th>Temperature range °C</th><th>Ideal °C</th><th>Humidity ramp %</th><th>Rainfall mm / month</th><th>w₁ / w₂</th></tr></thead>
                <tbody>
                  {DISEASES.map((d) => (
                    <tr key={d.id}>
                      <td className="left">{d.name}</td><td>{d.temp[0]}–{d.temp[3]}</td><td>{d.temp[1]}–{d.temp[2]}</td><td>{d.hum[0]} → {d.hum[1]}</td>
                      <td>{d.rain.type === 'suppress' ? `lowers above ${d.rain.from}` : `${d.rain.from} → ${d.rain.to}`}</td><td>{d.weights.join(' / ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              Ranges are simplified from standard plant-pathology references such as Agrios, <em>Plant Pathology</em> (5th ed., 2005), and Indian extension
              material. The score has not been trained or validated against outbreak records; it is a transparent starting point for a future
              machine-learning model, not a replacement for one.
            </p>
          </section>

          <section className="section" id="stack">
            <div className="section-head" data-reveal><h2>Technology</h2></div>
            <div className="explain" data-stagger>
              <div><h4><Code2 aria-hidden="true" />React and Vite</h4><p>A single-page React application with client-side routing, built with Vite. Everything runs in the browser.</p></div>
              <div><h4><BarChart3 aria-hidden="true" />Recharts and SVG</h4><p>Interactive charts with tooltips; heat grids, the texture triangle and the landscapes are drawn in SVG.</p></div>
              <div><h4><ShieldCheck aria-hidden="true" />PapaParse</h4><p>Reads uploaded CSV files in the browser, so data never leaves the user’s computer.</p></div>
              <div><h4><Workflow aria-hidden="true" />GSAP and Lenis</h4><p>Scroll-linked animation and smooth scrolling, switched off for anyone who prefers reduced motion.</p></div>
              <div><h4><Database aria-hidden="true" />Node.js scripts</h4><p>Fetch the public APIs and build the processed JSON files the site loads.</p></div>
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
