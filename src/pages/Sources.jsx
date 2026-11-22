import { Download, Satellite, Layers, Landmark, ExternalLink } from 'lucide-react';
import { Page, PageBanner } from '../components/Page';
import { REGIONS, SOIL, WEATHER, YIELDS, META, fmt } from '../lib/data';
import { weatherCsv, soilCsv, yieldCsv, download } from '../lib/exportCsv';
import { PHOTOS } from '../lib/photos';

function SourceBlock({ icon: Icon, title, org, rows, children, file, make, link }) {
  return (
    <article className="panel" data-reveal style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'start', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="source-card" style={{ padding: 0, border: 0, background: 'none' }}><span className="ic"><Icon aria-hidden="true" /></span></span>
          <div><h2 style={{ fontSize: '1.6rem' }}>{title}</h2><p className="sub">{org}</p></div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => download(file, make())}><Download aria-hidden="true" />Download CSV</button>
          <a className="btn btn-quiet" href={link} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />Source website</a>
        </div>
      </div>
      <dl className="kv" style={{ gridTemplateColumns: '170px 1fr' }}>
        {rows.map(([k, v]) => <FragmentKV key={k} k={k} v={v} />)}
      </dl>
      {children && <p className="note" style={{ marginTop: 0 }}>{children}</p>}
    </article>
  );
}
function FragmentKV({ k, v }) { return (<><dt>{k}</dt><dd>{v}</dd></>); }

export default function Sources() {
  const fetched = new Date(META.fetchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Page>
      <PageBanner photo="standing" crumb="Data sources" title="Where every number comes from.">
        Three public, citable sources, downloaded by repeatable scripts. Nothing on this site is invented, estimated by hand or filled in.
        Download any dataset as CSV below.
      </PageBanner>
      <div className="page-body">
        <div className="wrap" style={{ display: 'grid', gap: 20 }}>
          <SourceBlock icon={Satellite} title="Weather" org="NASA POWER (Prediction Of Worldwide Energy Resources)" file="cropshield-weather-2015-2024.csv" make={weatherCsv} link="https://power.larc.nasa.gov/"
            rows={[
              ['Product', 'Monthly point data, Agroclimatology community, API v2'],
              ['Variables', 'Temperature at 2 m (mean, monthly highest, monthly lowest), relative humidity at 2 m, bias-corrected precipitation total'],
              ['Underlying model', 'NASA MERRA-2 reanalysis, about 50 km grid'],
              ['Period', 'January 2015 to December 2024'],
              ['Locations', REGIONS.map((r) => `${r.station} (${r.name})`).join(', ')],
              ['Records', `${fmt(WEATHER.length)} (12 months × 10 years × 8 locations)`],
              ['Downloaded', fetched],
            ]}>
            Reanalysis describes the area around each point rather than a single rain gauge, so totals can differ from IMD station records.
          </SourceBlock>
          <SourceBlock icon={Layers} title="Soil" org="ISRIC – World Soil Information, SoilGrids 2.0" file="cropshield-soil.csv" make={soilCsv} link="https://soilgrids.org/"
            rows={[
              ['Product', 'SoilGrids 2.0 REST API, mean predictions at 250 m'],
              ['Variables', 'pH (water), soil organic carbon, total nitrogen, cation exchange capacity, bulk density, clay, sand, silt'],
              ['Depth', '0–5, 5–15 and 15–30 cm, weighted by thickness into one 0–30 cm value'],
              ['Sampling', `Three farmland points per state; points on urban or water areas have no prediction (${SOIL.filter((s) => s.samplePoints < 3).length} states use two points)`],
              ['Licence', 'CC BY 4.0'],
              ['Downloaded', fetched],
            ]}>
            Values are machine-learning model estimates from global soil profiles, not laboratory tests. Total nitrogen differs from the
            available nitrogen on Soil Health Cards.
          </SourceBlock>
          <SourceBlock icon={Landmark} title="Crop yield" org="Ministry of Agriculture and Farmers Welfare, Government of India" file="cropshield-yields-2013-2023.csv" make={yieldCsv} link="https://www.rbi.org.in/Scripts/PublicationsView.aspx?id=22146"
            rows={[
              ['Published in', 'Reserve Bank of India, Handbook of Statistics on Indian States, tables of state-wise yield (November 2023 edition)'],
              ['Crops', 'Rice, wheat, coarse cereals, pulses, oilseeds, sugarcane'],
              ['Period', '2013-14 to 2022-23 (2022-23: third advance estimates)'],
              ['Coverage', 'The eight states and All India'],
              ['Records', `${fmt(YIELDS.length)} published figures`],
            ]}>
            Figures are shown exactly as published; gaps are left empty. Maharashtra’s 2022-23 wheat yield (3,356 kg/ha) is far above its earlier
            years and may change in final estimates. Cotton and total foodgrains were left out because the published tables for them looked
            inconsistent.
          </SourceBlock>
          <article className="panel" data-reveal>
            <h2 style={{ fontSize: '1.6rem' }}>Photographs</h2>
            <p className="sub" style={{ margin: '6px 0 16px' }}>All photographs are from Unsplash and used under the Unsplash License. Thank you to these photographers:</p>
            <ul className="credits">
              {[...new Set(Object.values(PHOTOS).map((p) => p.by))].map((by) => (
                <li key={by}><a href={`https://unsplash.com/@${by}`} target="_blank" rel="noreferrer">@{by}</a></li>
              ))}
            </ul>
          </article>
          <div className="callout" data-reveal>
            <Download aria-hidden="true" />
            <span>The raw API downloads are kept in the project’s <code>data-raw</code> folder, and <code>scripts/fetch-data.mjs</code> and <code>scripts/build-data.mjs</code> rebuild everything from scratch.</span>
          </div>
        </div>
      </div>
    </Page>
  );
}
