import { CircleCheck, CircleAlert, TriangleAlert, OctagonAlert } from 'lucide-react';
import { fmt } from '../lib/data';

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.5 4.5 7v8.2c0 7 4.8 12.4 11.5 14.3 6.7-1.9 11.5-7.3 11.5-14.3V7L16 2.5Z" fill="var(--indigo)" />
      <path d="M16 24.5V13" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 17.5c-3.6 0-5.6-2.2-5.8-5.6 3.5 0 5.6 2 5.8 5.6Zm0-2.6c.2-3.4 2.3-5.4 5.8-5.4-.2 3.4-2.2 5.4-5.8 5.4Z" fill="var(--paper)" />
    </svg>
  );
}

const LEVEL_ICON = { good: CircleCheck, warning: CircleAlert, serious: TriangleAlert, critical: OctagonAlert };

export function RiskBadge({ level, score }) {
  const Icon = LEVEL_ICON[level.key];
  return (
    <span className={`badge lv-${level.key}`}>
      <Icon aria-hidden="true" />
      {level.label}
      {score != null && <span className="sr-only">, score {score}</span>}
    </span>
  );
}

/** Shared tooltip for Recharts charts. `rows` maps a payload entry to {label, color, value}. */
export function ChartTip({ active, payload, label, title, unit = '', digits = 0, names = {} }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value != null);
  return (
    <div className="chart-tip">
      <div className="t">{title ? title(label) : label}</div>
      {rows.map((p) => (
        <div className="r" key={p.dataKey}>
          <span>
            <i className="dot" style={{ background: p.color || p.stroke || p.fill }} />
            {names[p.dataKey] || p.name}
          </span>
          <b>
            {fmt(p.value, digits)}
            {unit && ` ${unit}`}
          </b>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <div className="legend" aria-hidden="true">
      {items.map((it) => (
        <span key={it.label}>
          <i className={it.line ? 'line' : ''} style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
