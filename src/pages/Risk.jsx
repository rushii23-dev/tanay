import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page, PageBanner } from '../components/Page';
import { Info } from 'lucide-react';
import { REGIONS, regionById, climatology, MONTHS, fmt } from '../lib/data';
import { DISEASES, diseaseById, scoreDisease } from '../lib/risk';
import { RiskBadge } from '../components/ui';

function initialFromQuery(q) {
  const state = regionById[q.get('state')] ? q.get('state') : 'west-bengal';
  const m = Number(q.get('month'));
  const month = Number.isInteger(m) && m >= 0 && m < 12 ? m : 7;
  const c = climatology(state)[month];
  return { state, month, temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall };
}

export default function Risk() {
  const [q] = useSearchParams();
  const [init] = useState(() => initialFromQuery(q));
  const [state, setState] = useState(init.state);
  const [month, setMonth] = useState(init.month);
  const [cond, setCond] = useState({ temperature: init.temperature, humidity: init.humidity, rainfall: init.rainfall });
  const [loaded, setLoaded] = useState(true);
  const [selected, setSelected] = useState(diseaseById[q.get('disease')] ? q.get('disease') : 'rice-blast');

  const results = useMemo(() => DISEASES.map((d) => ({ d, ...scoreDisease(d, cond) })), [cond]);
  const sel = results.find((r) => r.d.id === selected);

  const loadFrom = (s, m) => {
    const c = climatology(s)[m];
    setCond({ temperature: c.tMean, humidity: c.humidity, rainfall: c.rainfall });
    setLoaded(true);
  };
  const set = (k) => (e) => { setCond((c) => ({ ...c, [k]: Number(e.target.value) })); setLoaded(false); };

  return (
    <Page>
      <PageBanner photo="leafYellow" crumb="Disease risk" title="Is the weather working for the disease?" wheat>
        Set temperature, humidity and rainfall, or load a state’s real averages for any month, to see how favourable they are for six common crop diseases.
      </PageBanner>
      <div className="page-body">
      <div className="wrap">
        <header className="page-head">
          <h1>Disease risk</h1>
          <p>
            Set the average weather conditions, or load a state’s real averages for any month, to see how favourable they are for six common
            crop diseases. Scores run from 0 (unfavourable) to 100 (ideal for the disease).
          </p>
        </header>

        <div className="risk-layout">
          <section className="panel controls" aria-labelledby="cond-h">
            <div>
              <h3 id="cond-h">Conditions</h3>
              <p className="sub">
                {loaded ? `10-year average for ${regionById[state].name} in ${MONTHS[month]}` : 'Your own values'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10 }}>
              <label className="field">
                <span>State</span>
                <select className="select" value={state} onChange={(e) => { setState(e.target.value); loadFrom(e.target.value, month); }}>
                  {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Month</span>
                <select className="select" value={month} onChange={(e) => { setMonth(Number(e.target.value)); loadFrom(state, Number(e.target.value)); }}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </label>
            </div>
            {!loaded && (
              <button className="linkish" style={{ justifySelf: 'start', fontSize: '0.9rem' }} onClick={() => loadFrom(state, month)}>
                Reset to {regionById[state].name}, {MONTHS[month]} averages
              </button>
            )}
            <Slider id="t" label="Average temperature" unit="°C" min={0} max={45} step={0.5} value={cond.temperature} onChange={set('temperature')} />
            <Slider id="h" label="Relative humidity" unit="%" min={10} max={100} step={1} value={cond.humidity} onChange={set('humidity')} />
            <Slider id="r" label="Rainfall in the month" unit="mm" min={0} max={600} step={5} value={cond.rainfall} onChange={set('rainfall')} />
          </section>

          <div>
            <section data-reveal className="panel" aria-labelledby="res-h">
              <h3 id="res-h" style={{ marginBottom: 12 }}>Scores for these conditions</h3>
              <div className="disease-list">
                {results.map((r) => (
                  <button key={r.d.id} className="disease-btn" aria-pressed={selected === r.d.id} onClick={() => setSelected(r.d.id)}>
                    <span className="nm">{r.d.name}</span>
                    <span className="cr">{r.d.crop}</span>
                    <span className="sc">{r.score}<RiskBadge level={r.level} /></span>
                  </button>
                ))}
              </div>
            </section>
            <Detail r={sel} cond={cond} />
          </div>
        </div>

        <div className="callout" style={{ marginTop: 28 }}>
          <Info aria-hidden="true" />
          <span>
            <strong>This is a preliminary, rule-based index, not a forecast.</strong> It compares average weather with conditions that plant-pathology
            references describe as favourable for each disease. It has not been trained or validated on field outbreak data, and it ignores
            crop variety, growth stage, leaf wetness hours and whether the pathogen is present. Use it to explore patterns, and follow your
            local agricultural university or Krishi Vigyan Kendra for advice on spraying.
          </span>
        </div>
      </div>
      </div>
    </Page>
  );
}

function Slider({ id, label, unit, value, onChange, min, max, step }) {
  return (
    <div className="slider">
      <div className="slider-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{fmt(value, step < 1 ? 1 : 0)}<small>{unit}</small></output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      <div className="hint"><span>{min} {unit}</span><span>{max} {unit}</span></div>
    </div>
  );
}

function Detail({ r, cond }) {
  const { d } = r;
  const [w1, w2] = d.weights;
  const f = (x) => x.toFixed(2);
  const rainText = d.rain.type === 'suppress'
    ? `less rain is better; heavy rain over ${d.rain.to} mm cuts the score by 70 %`
    : `rises from ${d.rain.from} to ${d.rain.to} mm in the month`;
  return (
    <section data-reveal className="panel" aria-labelledby="det-h" style={{ marginTop: 20 }}>
      <div className="chart-head">
        <div>
          <h3 id="det-h">{d.name}</h3>
          <p className="sub">{d.crop}. Caused by <em>{d.pathogen}</em></p>
        </div>
      </div>
      <div className="score-big">
        <div className="score-num">{r.score}<small> / 100</small></div>
        <div style={{ paddingBottom: 10 }}><RiskBadge level={r.level} /></div>
      </div>

      <div className="factors" style={{ marginTop: 24 }}>
        <Factor label="Temperature fit" v={r.T} detail={`${fmt(cond.temperature, 1)} °C`} />
        <Factor label="Humidity fit" v={r.H} detail={`${fmt(cond.humidity)} %`} />
        <Factor label="Rainfall fit" v={r.R} detail={`${fmt(cond.rainfall)} mm`} />
      </div>

      <p style={{ marginTop: 20, fontSize: '0.92rem', color: 'var(--ink-2)' }}>
        Score = 100 × temperature × ({w1} × humidity + {w2} × rainfall) = 100 × {f(r.T)} × ({w1} × {f(r.H)} + {w2} × {f(r.R)}) = <strong style={{ color: 'var(--ink)' }}>{r.score}</strong>
      </p>

      <dl className="kv" style={{ marginTop: 22, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        <dt>Favoured by</dt><dd>{d.favoured}</dd>
        <dt>Temperature</dt><dd>Possible from {d.temp[0]} to {d.temp[3]} °C, ideal {d.temp[1]}–{d.temp[2]} °C</dd>
        <dt>Humidity</dt><dd>Fit rises from {d.hum[0]} % to full at {d.hum[1]} % and above</dd>
        <dt>Rainfall</dt><dd>Fit {rainText}</dd>
        <dt>Signs in the field</dt><dd>{d.signs}</dd>
      </dl>
    </section>
  );
}

function Factor({ label, v, detail }) {
  return (
    <div className="factor">
      <span>{label}<small style={{ display: 'block', color: 'var(--ink-3)', fontSize: '0.8rem' }}>{detail}</small></span>
      <div className="track" role="img" aria-label={`${label} ${Math.round(v * 100)} percent`}><div style={{ width: `${v * 100}%` }} /></div>
      <b>{f2(v)}</b>
    </div>
  );
}
const f2 = (x) => x.toFixed(2);
