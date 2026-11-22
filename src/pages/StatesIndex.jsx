import { Link } from 'react-router-dom';
import { Page, PageBanner } from '../components/Page';
import { CardArt } from '../components/Scene';
import {
  REGIONS, summary, latestYield, colorOf, fmt, STATE_INFO, climatology, phLabel, textureClass, seasonalRain,
} from '../lib/data';

export default function StatesIndex() {
  return (
    <Page>
      <PageBanner photo="greenField" crumb="States" title="Eight states, eight ways of farming.">
        From the irrigated wheat fields of Punjab to the north-east-monsoon rice of Tamil Nadu, each state has its own climate, soil and
        crops. Choose one to see its full profile.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <div className="state-cards" data-stagger style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
            {REGIONS.map((r, i) => {
              const s = summary(r.id);
              const clim = climatology(r.id);
              const max = Math.max(...clim.map((c) => c.rainfall));
              const wheat = latestYield(r.id, 'wheat');
              const rice = latestYield(r.id, 'rice');
              const seas = seasonalRain(r.id);
              return (
                <Link key={r.id} to={`/states/${r.id}`} className="state-card" data-tilt>
                  <div className="art"><CardArt color={colorOf(r.id)} seed={i + 1} /></div>
                  <div className="body">
                    <h3><span className="dot" style={{ background: colorOf(r.id) }} />{r.name}</h3>
                    <span className="crops">{STATE_INFO[r.id].zone}. Main crops: {STATE_INFO[r.id].crops.join(', ')}</span>
                    <div className="spark" title="Average monthly rainfall, January to December">
                      {clim.map((c) => <i key={c.month} style={{ height: `${Math.max(4, (c.rainfall / max) * 100)}%` }} />)}
                    </div>
                    <dl>
                      <div><dt>Rain a year</dt><dd>{fmt(s.annualRain)}<small>mm</small></dd></div>
                      <div><dt>Monsoon share</dt><dd>{fmt(seas.monsoonPct)}<small>%</small></dd></div>
                      <div><dt>Mean temperature</dt><dd>{fmt(s.tMean, 1)}<small>°C</small></dd></div>
                      <div><dt>Humidity</dt><dd>{fmt(s.humidity)}<small>%</small></dd></div>
                      <div><dt>Soil pH</dt><dd>{fmt(s.soil.ph, 1)}<small>{phLabel(s.soil.ph).split(' ').pop()}</small></dd></div>
                      <div><dt>Soil texture</dt><dd style={{ fontSize: '0.98rem' }}>{textureClass(s.soil.sand, s.soil.silt, s.soil.clay)}</dd></div>
                      <div><dt>Rice yield</dt><dd>{rice ? fmt(rice.value) : '—'}<small>kg/ha</small></dd></div>
                      <div><dt>Wheat yield</dt><dd>{wheat ? fmt(wheat.value) : '—'}<small>kg/ha</small></dd></div>
                    </dl>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="note" data-reveal>
            Monsoon share is the part of a year’s rain that falls in June–September. Yields are the latest official figures (2022-23 third advance
            estimates where published). A dash means the crop is not grown at a reportable scale.
          </p>
        </div>
      </div>
    </Page>
  );
}
