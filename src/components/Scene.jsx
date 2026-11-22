// Illustrated farm landscapes drawn in SVG, coloured from theme tokens so they switch to night in dark mode.
import { useMemo } from 'react';

function rows(count, y0, y1, curve, color, width = 2, opacity = 0.35) {
  // curved crop rows across a hill band
  return Array.from({ length: count }, (_, i) => {
    const y = y0 + ((y1 - y0) * i) / (count - 1);
    return <path key={i} d={`M-20 ${y + curve} Q 720 ${y - curve} 1460 ${y + curve * 0.6}`} stroke={color} strokeWidth={width} fill="none" opacity={opacity} />;
  });
}

function wheatStalks(n, seed = 7) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, (_, i) => {
    const x = (i / n) * 1500 - 30 + rand() * 12;
    const h = 60 + rand() * 70;
    const lean = (rand() - 0.5) * 18;
    const top = 900 - h;
    return (
      <g key={i}>
        <path d={`M${x} 905 Q ${x + lean * 0.4} ${900 - h / 2} ${x + lean} ${top}`} stroke="var(--wheat-dark)" strokeWidth="2" fill="none" />
        <ellipse cx={x + lean} cy={top - 8} rx="4" ry="12" fill="var(--wheat-field)" transform={`rotate(${lean} ${x + lean} ${top - 8})`} />
      </g>
    );
  });
}

export function HeroScene() {
  const stalks = useMemo(() => wheatStalks(150), []);
  return (
    <svg className="scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--sky-top)" />
          <stop offset="0.55" stopColor="var(--sky-mid)" />
          <stop offset="1" stopColor="var(--sky-low)" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="var(--sun)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fieldFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--field)" />
          <stop offset="1" stopColor="var(--hill-near)" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#sky)" />
      <g className="layer" data-depth="0.15"><g data-anim="sun">
        <circle cx="1110" cy="300" r="190" fill="url(#glow)" />
        <circle cx="1110" cy="300" r="64" fill="var(--sun)" />
      </g>
      </g>
      <g className="layer" data-depth="0.25"><g data-anim="clouds" fill="var(--cloud)" opacity="0.85">
        <g className="cloud" style={{ transformBox: 'fill-box' }}>
          <ellipse cx="260" cy="190" rx="90" ry="26" /><ellipse cx="310" cy="172" rx="56" ry="34" /><ellipse cx="220" cy="180" rx="44" ry="24" />
        </g>
        <g className="cloud">
          <ellipse cx="820" cy="140" rx="70" ry="20" /><ellipse cx="860" cy="126" rx="44" ry="26" />
        </g>
        <g className="cloud">
          <ellipse cx="1300" cy="430" rx="80" ry="20" /><ellipse cx="1260" cy="418" rx="44" ry="22" />
        </g>
      </g>
      </g>
      <g className="layer" data-depth="0.3"><g data-anim="hill">
        <path d="M0 560 C 180 500 360 520 520 545 C 700 572 860 500 1040 510 C 1210 520 1330 560 1440 540 L1440 900 L0 900Z" fill="var(--hill-far)" />
        {/* tree line */}
        {[140, 168, 190, 610, 636, 1180, 1204, 1232].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i < 3 ? 524 : i < 5 ? 548 : 520})`} fill="var(--hill-near)">
            <rect x="-2" y="0" width="4" height="16" fill="var(--soil)" />
            <circle cx="0" cy="-6" r={12 + (i % 3) * 3} />
          </g>
        ))}
      </g>
      </g>
      <g className="layer" data-depth="0.45"><g data-anim="hill">
        <path d="M0 640 C 220 590 420 610 640 640 C 860 670 1080 600 1260 610 C 1350 615 1400 630 1440 625 L1440 900 L0 900Z" fill="var(--hill-mid)" />
        <g clipPath="url(#midClip)">{rows(7, 640, 760, 18, 'var(--hill-near)', 3, 0.35)}</g>
        <clipPath id="midClip"><path d="M0 640 C 220 590 420 610 640 640 C 860 670 1080 600 1260 610 C 1350 615 1400 630 1440 625 L1440 900 L0 900Z" /></clipPath>
        {/* farmhouse */}
        <g transform="translate(1010 598)">
          <rect x="0" y="0" width="54" height="34" fill="var(--soil-soft)" />
          <path d="M-6 2 L27 -22 L60 2Z" fill="var(--soil)" />
          <rect x="21" y="14" width="12" height="20" fill="var(--soil)" />
          <rect x="70" y="-18" width="16" height="52" rx="8" fill="var(--wheat-dark)" />
        </g>
      </g>
      </g>
      <g className="layer" data-depth="0.65"><g data-anim="hill">
        <path d="M0 720 C 260 680 520 700 760 735 C 1000 770 1220 700 1440 715 L1440 900 L0 900Z" fill="url(#fieldFade)" />
        <clipPath id="nearClip"><path d="M0 720 C 260 680 520 700 760 735 C 1000 770 1220 700 1440 715 L1440 900 L0 900Z" /></clipPath>
        <g clipPath="url(#nearClip)">{rows(9, 730, 900, 26, 'var(--leaf-deep)', 4, 0.25)}</g>
      </g>
      </g>
      <g className="layer" data-depth="0.9"><g data-anim="wheat">
        <path d="M0 830 C 300 805 640 815 900 830 C 1150 845 1300 820 1440 825 L1440 900 L0 900Z" fill="var(--wheat-field)" />
        {stalks}
      </g>
      </g>
    </svg>
  );
}

/** Low rolling-hill strip for the bottom of page banners and the closing section. */
export function HillStrip({ wheat = false }) {
  const stalks = useMemo(() => (wheat ? wheatStalks(110, 3) : null), [wheat]);
  return (
    <svg className="scene" viewBox="0 700 1440 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 760 C 200 720 420 735 640 755 C 860 775 1080 725 1260 732 C 1350 736 1400 745 1440 742 L1440 900 L0 900Z" fill="var(--hill-far)" />
      <path d="M0 805 C 260 772 520 788 760 812 C 1000 836 1220 784 1440 796 L1440 900 L0 900Z" fill="var(--hill-mid)" />
      <path d="M0 850 C 300 830 640 840 900 852 C 1150 864 1300 842 1440 848 L1440 900 L0 900Z" fill={wheat ? 'var(--wheat-field)' : 'var(--hill-near)'} />
      {stalks}
    </svg>
  );
}

/** Small landscape for state cards, tinted with the state's colour. */
export function CardArt({ color, seed = 1 }) {
  const a = 20 + (seed * 37) % 40;
  const b = 30 + (seed * 53) % 50;
  return (
    <svg viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
      <rect width="320" height="110" fill="var(--sky-mid)" />
      <circle cx={250 - seed * 13} cy={34} r="14" fill="var(--sun)" />
      <path d={`M0 ${70 - a / 4} C 80 ${50 + a / 3} 160 ${72 - b / 5} 320 ${58}L320 110 L0 110Z`} fill="var(--hill-far)" />
      <path d={`M0 ${88} C 90 ${74 + b / 6} 200 ${96 - a / 5} 320 ${80}L320 110 L0 110Z`} fill={color} opacity="0.85" />
      <path d={`M0 ${100} C 120 ${92} 220 ${104} 320 ${96}L320 110 L0 110Z`} fill="var(--hill-near)" />
    </svg>
  );
}
