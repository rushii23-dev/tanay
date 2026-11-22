import { Link } from 'react-router-dom';
import { Wheat, Thermometer, Droplets, CloudRain, ShieldCheck, Search } from 'lucide-react';
import { Page, PageBanner, Toc } from '../components/Page';
import { RiskBadge } from '../components/ui';
import { REGIONS, MONTHS, climatology, regionById, fmt } from '../lib/data';
import { DISEASES, scoreDisease } from '../lib/risk';

// General, widely recommended practices. Always follow local agricultural-university advice for chemical control.
const MANAGEMENT = {
  'rice-blast': ['Grow blast-resistant varieties recommended for the area', 'Avoid excess nitrogen fertiliser, apply it in split doses', 'Treat seed before sowing and destroy infected stubble'],
  'bacterial-blight': ['Grow resistant varieties', 'Use balanced nitrogen and keep field bunds clean', 'Avoid letting water flow from infected fields into healthy ones'],
  'yellow-rust': ['Sow resistant varieties at the recommended time', 'Scout fields closely in January–February', 'Spray only when advised by local experts on seeing first stripes'],
  'leaf-rust': ['Use resistant varieties', 'Remove volunteer wheat plants that carry the fungus between seasons', 'Spray when advised once pustules appear'],
  'late-blight': ['Plant healthy, certified seed tubers', 'Avoid overhead irrigation and remove infected plants early', 'Protective spray before cool, wet spells, as advised locally'],
  'powdery-mildew': ['Grow tolerant varieties', 'Space plants for good air flow', 'Use sulphur-based or other recommended fungicides at first sign'],
};

function topConditions(d) {
  const all = [];
  for (const r of REGIONS) {
    climatology(r.id).forEach((c) => {
      const s = scoreDisease(d, { temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall });
      all.push({ r, c, s });
    });
  }
  return all.sort((a, b) => b.s.score - a.s.score).slice(0, 3);
}

export default function Diseases() {
  return (
    <Page>
      <PageBanner photo="leafSpots" crumb="Disease library" title="Six crop diseases and the weather they love.">
        What causes each disease, how to spot it, the conditions that favour it, and the states and months where the 10-year average weather
        suits it best.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={DISEASES.map((d) => [d.id, d.name])} />
          {DISEASES.map((d) => {
            const top = topConditions(d);
            return (
              <article className="dz" id={d.id} key={d.id}>
                <div data-reveal="left">
                  <span className="crop"><Wheat size={16} aria-hidden="true" />{d.crop}</span>
                  <h2>{d.name}</h2>
                  <p className="pathogen">{d.pathogen}</p>
                  <p style={{ marginTop: 16, color: 'var(--ink-2)' }}>{d.favoured}</p>
                  <dl className="kv" style={{ marginTop: 20 }}>
                    <dt><Thermometer size={14} aria-hidden="true" /> Temperature</dt><dd>Ideal {d.temp[1]}–{d.temp[2]} °C, possible {d.temp[0]}–{d.temp[3]} °C</dd>
                    <dt><Droplets size={14} aria-hidden="true" /> Humidity</dt><dd>Rises from {d.hum[0]} %, strongest above {d.hum[1]} %</dd>
                    <dt><CloudRain size={14} aria-hidden="true" /> Rainfall</dt><dd>{d.rain.type === 'suppress' ? `Heavy rain (over ${d.rain.to} mm a month) washes spores off` : `Favoured from ${d.rain.from} mm, strongest at ${d.rain.to} mm a month`}</dd>
                    <dt><Search size={14} aria-hidden="true" /> Signs</dt><dd>{d.signs}</dd>
                  </dl>
                  <h3 style={{ marginTop: 22, fontSize: '1rem', display: 'flex', gap: 8, alignItems: 'center' }}><ShieldCheck size={18} aria-hidden="true" style={{ color: 'var(--indigo)' }} />Good practice</h3>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: 'var(--ink-2)', display: 'grid', gap: 4 }}>
                    {MANAGEMENT[d.id].map((m) => <li key={m}>{m}</li>)}
                  </ul>
                  <Link className="btn btn-quiet" style={{ marginTop: 20 }} to={`/risk?disease=${d.id}&state=${top[0].r.id}&month=${top[0].c.monthIndex}`}>Score conditions for {d.name.toLowerCase()}</Link>
                </div>
                <div data-reveal="right">
                  <div className="panel">
                    <h3>Most favourable state-months</h3>
                    <p className="sub" style={{ marginBottom: 14 }}>Highest scores from each state’s 10-year monthly averages</p>
                    <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
                      {top.map(({ r, c, s }) => (
                        <div key={r.id + c.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span><b>{regionById[r.id].name}, {c.month}</b> <span className="sub">{fmt(c.tMean, 1)} °C, {c.humidity}% humidity, {c.rainfall} mm</span></span>
                          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{s.score}</b><RiskBadge level={s.level} /></span>
                        </div>
                      ))}
                    </div>
                    <div className="heat-wrap">
                      <div className="mini-heat" role="table" aria-label={`${d.name} score by state and month`}>
                        <div role="row" style={{ display: 'contents' }}>
                          <div />
                          {MONTHS.map((m) => <div className="hd" key={m} role="columnheader">{m[0]}</div>)}
                        </div>
                        {REGIONS.map((r) => (
                          <div role="row" style={{ display: 'contents' }} key={r.id}>
                            <div className="rl" role="rowheader">{r.name}</div>
                            {climatology(r.id).map((c) => {
                              const s = scoreDisease(d, { temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall });
                              return <div role="cell" key={c.month} className={`cell lv-${s.level.key}`} title={`${r.name}, ${c.month}: ${s.score} (${s.level.label})`}>{s.score}</div>;
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="note">Weather suitability only: it does not know whether the crop is in the field that month.</p>
                  </div>
                </div>
              </article>
            );
          })}
          <div className="callout" data-reveal>
            <ShieldCheck aria-hidden="true" />
            <span>
              The practices listed are general guidance found across Indian agricultural extension material. For variety choice and any chemical
              control, follow your state agricultural university or Krishi Vigyan Kendra.
            </span>
          </div>
        </div>
      </div>
    </Page>
  );
}
