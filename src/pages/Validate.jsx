import { Page, PageBanner } from '../components/Page';
import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, Download, FileWarning, OctagonAlert, TriangleAlert, Wand2, CircleCheck, RotateCcw } from 'lucide-react';
import { WEATHER, SOIL, YIELDS, fmt } from '../lib/data';
import { weatherCsv, soilCsv, yieldCsv, practiceCsv, download } from '../lib/exportCsv';
import { validate, SCHEMAS, KIND_LABEL } from '../lib/validate';

const SAMPLES = [
  { id: 'practice', label: 'Practice file with planted errors', file: 'practice-weather-with-errors.csv', make: practiceCsv },
  { id: 'weather', label: `Weather, ${WEATHER.length} rows`, file: 'cropshield-weather-2015-2024.csv', make: weatherCsv },
  { id: 'soil', label: `Soil, ${SOIL.length} rows`, file: 'cropshield-soil.csv', make: soilCsv },
  { id: 'yield', label: `Crop yield, ${YIELDS.filter((y) => y.region !== 'india').length} rows`, file: 'cropshield-yields-2013-2023.csv', make: yieldCsv },
];

function parseCsv(text) {
  const res = Papa.parse(text, { header: true, skipEmptyLines: false, transformHeader: (h) => h.trim() });
  let rows = res.data;
  while (rows.length && Object.values(rows[rows.length - 1]).every((v) => String(v ?? '').trim() === '')) rows = rows.slice(0, -1);
  return { rows, headers: res.meta.fields || [], parseErrors: res.errors.filter((e) => e.type !== 'FieldMismatch' || e.row < rows.length) };
}

export default function Validate() {
  const [input, setInput] = useState(null); // {name, rows, headers, parseErrors}
  const [type, setType] = useState(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const result = useMemo(() => (input ? validate(input.rows, input.headers, type) : null), [input, type]);

  const load = (name, text) => {
    setError('');
    const p = parseCsv(text);
    if (!p.headers.length || !p.rows.length) {
      setError(`${name} has no data rows. Check that the first line holds column names and the file is comma-separated.`);
      return;
    }
    setType(null);
    setInput({ name, ...p });
  };
  const onFile = (file) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError(`${file.name} is not a CSV file. Export the sheet as CSV (comma-separated) and try again.`);
      return;
    }
    file.text().then((t) => load(file.name, t));
  };

  return (
    <Page>
      <PageBanner photo="tractor" crumb="Check a dataset" title="Clean data before you trust it.">
        Upload a weather, soil or crop-yield CSV. CropShield AI recognises the columns, checks every row against eleven rules and gives you a cleaned copy. Files never leave your computer.
      </PageBanner>
      <div className="page-body">
      <div className="wrap">
        <header className="page-head">
          <h1>Check a dataset</h1>
          <p>
            Upload a weather, soil or crop-yield CSV file. CropShield AI recognises the columns, checks every row and gives you a cleaned
            copy. Files are checked in your browser and never leave your computer.
          </p>
        </header>

        {!result && (
          <>
            <div
              className={`drop ${over ? 'over' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); }}
            >
              <UploadCloud aria-hidden="true" />
              <strong>Drop a CSV file here, or choose one</strong>
              <p>Expected columns, in any order and with common alternative names:</p>
              <p>
                Weather: region, date, temperature, humidity, rainfall. Soil: region, pH, and optionally organic carbon, nitrogen, sand, silt, clay.
                Yield: region, year, crop, yield.
              </p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => onFile(e.target.files[0])} />
            </div>
            {error && <p className="callout" style={{ marginTop: 16 }} role="alert"><FileWarning aria-hidden="true" />{error}</p>}
            <div className="samples">
              <span>No file to hand? Try one:</span>
              {SAMPLES.map((s) => (
                <button key={s.id} className="btn btn-quiet" style={{ padding: '7px 12px', fontSize: '0.88rem' }} onClick={() => load(s.file, s.make())}>
                  {s.label}
                </button>
              ))}
            </div>
            <p className="note">
              The weather, soil and yield samples are the real data used across this site. The practice file is real Punjab weather for
              2023–24 with ten problems added on purpose, so you can see each check working.
            </p>
            <section className="section" style={{ paddingTop: 40 }}>
              <h2 style={{ marginBottom: 16 }}>What gets checked</h2>
              <div className="table-scroll">
                <table className="data compact">
                  <thead><tr><th className="left">Check</th><th className="left">Example</th><th className="left">What happens</th></tr></thead>
                  <tbody>
                    {[
                      ['Missing values', 'Empty humidity cell, “NA”, “null”', 'Row excluded'],
                      ['Duplicate rows', 'The same row entered twice', 'Second copy removed'],
                      ['Conflicting records', 'Two different readings for Punjab, 2023-07', 'Later row excluded'],
                      ['Invalid dates', '2023-13, 31/02/2024', 'Row excluded'],
                      ['Mixed date formats', '15/07/2024, Jul 2024', 'Rewritten as YYYY-MM(-DD)'],
                      ['Not a number', '“heavy” in the rainfall column', 'Row excluded'],
                      ['Impossible values', 'Humidity 140 %, pH 15', 'Row excluded'],
                      ['Unusual values', 'Rainfall 3,000 mm in a month', 'Kept, flagged for review'],
                      ['Unknown regions', 'Haryana, a misspelt name', 'Common spellings fixed, others excluded'],
                      ['Inconsistent values', 'Minimum temperature above maximum', 'Row excluded'],
                      ['Unit mix-ups', 'Temperatures in °F, humidity as 0–1', 'Flagged for the whole file'],
                    ].map(([a, b, c]) => <tr key={a}><td className="left">{a}</td><td className="left">{b}</td><td className="left">{c}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {result && <Report input={input} result={result} type={type} setType={setType} reset={() => setInput(null)} />}
      </div>
      </div>
    </Page>
  );
}

function Report({ input, result, setType, reset }) {
  const [show, setShow] = useState('problems');
  const schema = SCHEMAS[result.type];
  const list = result.issues.filter((i) => (show === 'problems' ? i.severity !== 'fixed' : show === i.severity));
  const ok = result.counts.error === 0 && result.counts.warning === 0 && result.missingCols.length === 0;
  const qColor = result.quality >= 95 ? 'var(--good)' : result.quality >= 80 ? 'var(--warning)' : 'var(--critical)';
  const baseName = input.name.replace(/\.(csv|txt)$/i, '');

  const cleanedCsv = () => Papa.unparse(result.clean, { columns: result.fields });
  const issuesCsv = () => Papa.unparse(result.issues.map((i) => ({ row: i.row, column: i.column, severity: i.severity, check: KIND_LABEL[i.kind] || i.kind, message: i.message, value: i.value })));

  return (
    <>
      <div className="report-head">
        <div>
          <h2 style={{ wordBreak: 'break-word' }}>{input.name}</h2>
          <p className="sub" style={{ marginTop: 6 }}>
            {fmt(result.rowCount)} rows, {input.headers.length} columns. Read as a{' '}
            <select className="select" style={{ padding: '4px 30px 4px 8px', fontSize: '0.9rem' }} value={result.type} onChange={(e) => setType(e.target.value)} aria-label="Dataset type">
              {Object.entries(SCHEMAS).map(([k, s]) => <option key={k} value={k}>{s.label.toLowerCase()}</option>)}
            </select>{' '}
            dataset{result.type === result.detectedType ? ' (detected automatically)' : ''}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => download(`${baseName}-cleaned.csv`, cleanedCsv())} disabled={result.missingCols.length > 0}>
            <Download aria-hidden="true" />Download cleaned CSV
          </button>
          <button className="btn btn-quiet" onClick={() => download(`${baseName}-issues.csv`, issuesCsv())} disabled={!result.issues.length}>
            Download issue list
          </button>
          <button className="btn btn-quiet" onClick={reset}><RotateCcw aria-hidden="true" />Check another file</button>
        </div>
      </div>

      {result.missingCols.length > 0 && (
        <div className="callout" style={{ marginTop: 20, background: 'color-mix(in srgb, var(--critical) 12%, var(--surface))' }} role="alert">
          <OctagonAlert aria-hidden="true" style={{ color: 'var(--critical-ink)' }} />
          <span>
            This file has no column for <strong>{result.missingCols.join(', ')}</strong>, which a {schema.label.toLowerCase()} dataset needs. Rename the
            column, or choose a different dataset type above.
          </span>
        </div>
      )}
      {result.datasetNotes.map((n) => (
        <div key={n} className="callout" style={{ marginTop: 12 }}><TriangleAlert aria-hidden="true" />{n}</div>
      ))}

      <div className="counts">
        <div className="count">
          <b>{result.quality}%</b>
          <span>Rows usable</span>
          <div className="meter" style={{ marginTop: 8, width: '100%' }}><div style={{ width: `${result.quality}%`, background: qColor }} /></div>
        </div>
        <div className="count"><b>{fmt(result.validCount)}</b><span>Rows in cleaned file</span></div>
        <div className="count"><b style={{ color: result.counts.error ? 'var(--critical-ink)' : undefined }}>{fmt(result.counts.error)}</b><span>Errors, rows excluded</span></div>
        <div className="count"><b style={{ color: result.counts.warning ? 'var(--warning-ink)' : undefined }}>{fmt(result.counts.warning)}</b><span>Warnings to review</span></div>
        <div className="count"><b>{fmt(result.counts.fixed)}</b><span>Fixed automatically</span></div>
      </div>

      {ok ? (
        <div className="callout"><CircleCheck aria-hidden="true" style={{ color: 'var(--good-ink)' }} />Every row passed. {result.counts.fixed ? `${result.counts.fixed} formatting details were standardised in the cleaned file.` : ''}</div>
      ) : (
        <div className="grid-report">
          <section data-reveal className="panel">
            <h3 style={{ marginBottom: 14 }}>Problems by type</h3>
            <div data-grow className="rank">
              {Object.entries(result.byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <div className="rank-row" key={k} style={{ gridTemplateColumns: '1fr auto' }}>
                  <span>{KIND_LABEL[k] || k}</span><span className="v">{n}</span>
                </div>
              ))}
            </div>
            <h3 style={{ margin: '24px 0 10px' }}>Columns recognised</h3>
            <dl className="kv" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {result.fields.map((f) => (<FragmentKV key={f} k={input.headers.find((h) => h === result.map[f])} v={f} />))}
            </dl>
            {result.unmapped.length > 0 && <p className="note">Not used: {result.unmapped.join(', ')}</p>}
          </section>
          <section data-reveal className="panel" style={{ marginTop: 0 }}>
            <div className="chart-head">
              <h3>Issues</h3>
              <div className="seg" role="group" aria-label="Filter issues">
                {[['problems', 'Errors and warnings'], ['error', 'Errors'], ['warning', 'Warnings'], ['fixed', 'Fixed']].map(([k, l]) => (
                  <button key={k} aria-pressed={show === k} onClick={() => setShow(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="issue-list table-scroll">
              <table className="data compact">
                <thead><tr><th className="left">Row</th><th className="left">Column</th><th className="left">Type</th><th className="left">Details</th></tr></thead>
                <tbody>
                  {list.slice(0, 300).map((i, n) => (
                    <tr key={n}>
                      <td className="left">{i.row}</td>
                      <td className="left">{i.column || 'Whole row'}</td>
                      <td className="left"><Sev s={i.severity} /></td>
                      <td className="left" style={{ whiteSpace: 'normal', minWidth: 240 }}>{i.message}</td>
                    </tr>
                  ))}
                  {!list.length && <tr><td colSpan={4} className="left">Nothing in this category.</td></tr>}
                </tbody>
              </table>
            </div>
            {list.length > 300 && <p className="note">Showing the first 300 of {fmt(list.length)}. Download the issue list for all of them.</p>}
          </section>
        </div>
      )}

      <section className="section" style={{ paddingTop: 36 }}>
        <h3 style={{ marginBottom: 6 }}>Preview of your file</h3>
        <p className="sub" style={{ marginBottom: 14 }}>First 40 rows as uploaded. Red cells are errors, yellow cells are warnings.</p>
        <div className="table-scroll" style={{ maxHeight: 460 }}>
          <table className="data compact">
            <thead><tr><th className="left">Row</th>{input.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {input.rows.slice(0, 40).map((r, i) => (
                <tr key={i}>
                  <td className="left">{i + 2}</td>
                  {input.headers.map((h) => {
                    const f = result.cellFlags[`${i}:${h}`];
                    return <td key={h} className={f || ''}>{String(r[h] ?? '')}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function FragmentKV({ k, v }) {
  return (<><dt>{k}</dt><dd>{v}</dd></>);
}

function Sev({ s }) {
  if (s === 'error') return <span className="sev sev-error"><OctagonAlert aria-hidden="true" />Error</span>;
  if (s === 'warning') return <span className="sev sev-warning"><TriangleAlert aria-hidden="true" />Warning</span>;
  return <span className="sev sev-fixed"><Wand2 aria-hidden="true" />Fixed</span>;
}
