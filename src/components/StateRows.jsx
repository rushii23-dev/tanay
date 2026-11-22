import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { REGIONS, summary, latestYield, colorOf, fmt, STATE_INFO, seasonalRain, phLabel } from '../lib/data';

/** Editorial index of the eight states: large serif names, key figures, a colour sweep on hover. */
export default function StateRows({ detailed = false }) {
  return (
    <ol className="state-rows" data-stagger style={{ '--figs': detailed ? 6 : 3 }}>
      {REGIONS.map((r) => {
        const s = summary(r.id);
        const rice = latestYield(r.id, 'rice');
        const wheat = latestYield(r.id, 'wheat');
        const seas = seasonalRain(r.id);
        return (
          <li key={r.id} style={{ '--state': colorOf(r.id) }}>
            <Link to={`/states/${r.id}`}>
              <span className="sr-name">{r.name}</span>
              <span className="sr-meta">
                {STATE_INFO[r.id].zone}
                <small>{STATE_INFO[r.id].crops.join(', ')}</small>
              </span>
              <span className="sr-fig"><b>{fmt(s.annualRain)}</b><small>mm rain a year</small></span>
              {detailed && <span className="sr-fig"><b>{fmt(seas.monsoonPct)}%</b><small>in the monsoon</small></span>}
              <span className="sr-fig"><b>{fmt(s.tMean, 1)}°</b><small>mean temperature</small></span>
              {detailed && <span className="sr-fig"><b>{fmt(s.soil.ph, 1)}</b><small>{phLabel(s.soil.ph).toLowerCase()} soil</small></span>}
              <span className="sr-fig"><b>{rice ? fmt(rice.value) : '—'}</b><small>rice kg/ha</small></span>
              {detailed && <span className="sr-fig"><b>{wheat ? fmt(wheat.value) : '—'}</b><small>wheat kg/ha</small></span>}
              <ArrowUpRight className="sr-arrow" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
