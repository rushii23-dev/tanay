import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { REGIONS, MONTHS, YEARS, weatherFor, fmt } from '../lib/data';

// Monthly rainfall bins (mm). Each bin maps to one step of the rain ramp.
const RAIN_BINS = [5, 15, 30, 60, 100, 150, 250, 400];
const rainColor = (mm) => {
  let i = RAIN_BINS.findIndex((b) => mm < b);
  if (i === -1) i = RAIN_BINS.length;
  return `var(--r${i})`;
};

export default function MonsoonStripes() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const show = (e, region, w) => {
    const box = ref.current.getBoundingClientRect();
    const cell = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(cell.left - box.left + cell.width / 2, 80), box.width - 80);
    setTip({ x, y: cell.top - box.top, region, w });
  };

  return (
    <figure className="stripes" ref={ref} onMouseLeave={() => setTip(null)} style={{ margin: '44px 0 0' }}>
      <figcaption className="sr-only">
        Monthly rainfall for eight states, January 2015 to December 2024. Darker blue means more rain. The table on this page lists the yearly figures.
      </figcaption>
      <div className="stripes-grid">
        {REGIONS.map((r) => (
          <Row key={r.id} region={r} onHover={show} />
        ))}
        <div className="stripes-years-pad" />
        <div className="stripes-years" aria-hidden="true">
          {YEARS.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
      </div>
      <div className="stripes-foot">
        <span>Monthly rainfall, 2015–2024. Source: NASA POWER, MERRA-2 bias-corrected precipitation.</span>
        <span className="ramp" aria-hidden="true">
          Under 5 mm
          <span className="ramp-swatches">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <i key={i} style={{ background: `var(--r${i})` }} />
            ))}
          </span>
          400 mm +
        </span>
      </div>
      {tip && (
        <div className="tooltip" style={{ left: tip.x, top: tip.y - 8, transform: 'translate(-50%, -100%)' }} role="status">
          <strong>
            {tip.region.name}, {MONTHS[Number(tip.w.date.slice(5)) - 1]} {tip.w.date.slice(0, 4)}
          </strong>
          {fmt(tip.w.rainfall)} mm rain
          <span className="muted">, {fmt(tip.w.tMean, 1)} °C, {fmt(tip.w.humidity)}% humidity</span>
        </div>
      )}
    </figure>
  );
}

function Row({ region, onHover }) {
  const rows = weatherFor(region.id);
  return (
    <>
      <div className="stripes-label">
        <Link to={`/states/${region.id}`}>{region.name}</Link>
      </div>
      <div className="stripes-row">
        {rows.map((w, i) => (
          <span key={w.date} style={{ background: rainColor(w.rainfall), '--i': i }} onMouseEnter={(e) => onHover(e, region, w)} />
        ))}
      </div>
    </>
  );
}
