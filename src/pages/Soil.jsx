import { Link } from 'react-router-dom';
import { FlaskConical, Leaf, Atom, Grip, Scale, Droplet } from 'lucide-react';
import { Page, PageBanner, Toc, PhotoReveal } from '../components/Page';
import { SplitText } from '../components/Photo';
import { REGIONS, SOIL, regionById, colorOf, fmt, phLabel, textureClass } from '../lib/data';

const ABBR = { punjab: 'PB', 'uttar-pradesh': 'UP', maharashtra: 'MH', karnataka: 'KA', 'tamil-nadu': 'TN', 'west-bengal': 'WB', gujarat: 'GJ', 'madhya-pradesh': 'MP' };

function Ternary() {
  const W = 520, H = 450, ox = 40, oy = 30;
  const pt = (sand, silt, clay) => {
    const t = sand + silt + clay;
    const A = [ox, oy + H], B = [ox + W, oy + H], C = [ox + W / 2, oy];
    return [(sand * A[0] + silt * B[0] + clay * C[0]) / t, (sand * A[1] + silt * B[1] + clay * C[1]) / t];
  };
  const lines = [];
  for (let v = 20; v < 100; v += 20) {
    lines.push([pt(100 - v, 0, v), pt(0, 100 - v, v), `clay ${v}`]);
    lines.push([pt(v, 100 - v, 0), pt(v, 0, 100 - v), `sand ${v}`]);
    lines.push([pt(100 - v, v, 0), pt(0, v, 100 - v), `silt ${v}`]);
  }
  return (
    <svg className="ternary" viewBox={`0 0 ${W + ox * 2} ${H + oy * 2 + 20}`} role="img" aria-label="Soil texture triangle showing sand, silt and clay for each state">
      <path className="edge" d={`M${pt(100, 0, 0)} L${pt(0, 100, 0)} L${pt(0, 0, 100)}Z`} />
      <g className="grid">{lines.map(([a, b, k]) => <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />)}</g>
      {[20, 40, 60, 80].map((v) => {
        const [x, y] = pt(100 - v, 0, v);
        return <text key={v} x={x - 8} y={y + 4} textAnchor="end">{v}%</text>;
      })}
      <text x={ox - 6} y={oy + H + 22} textAnchor="start" style={{ fontWeight: 650 }}>Sand</text>
      <text x={ox + W + 6} y={oy + H + 22} textAnchor="end" style={{ fontWeight: 650 }}>Silt</text>
      <text x={ox + W / 2} y={oy - 10} textAnchor="middle" style={{ fontWeight: 650 }}>Clay</text>
      {SOIL.map((s) => {
        const [x, y] = pt(s.sand, s.silt, s.clay);
        return (
          <g className="pt" key={s.region}>
            <title>{`${regionById[s.region].name}: sand ${s.sand}%, silt ${s.silt}%, clay ${s.clay}% (${textureClass(s.sand, s.silt, s.clay)})`}</title>
            <circle cx={x} cy={y} r="9" fill={colorOf(s.region)} />
            <text x={x + 13} y={y + 4}>{ABBR[s.region]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Soil() {
  const sorted = (k) => [...SOIL].sort((a, b) => b[k] - a[k]);
  const ocMax = Math.max(...SOIL.map((s) => s.organicCarbon));
  return (
    <Page>
      <PageBanner photo="soilHands" crumb="Soil" title="What lies beneath the crop.">
        Topsoil properties for each state from ISRIC SoilGrids: acidity, organic carbon, nitrogen, texture and the soil’s ability to hold
        nutrients. Each value is averaged over the top 30 cm at farmland sample points.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={[['ph', 'Soil pH'], ['texture', 'Texture'], ['carbon', 'Organic carbon'], ['table', 'All properties'], ['glossary', 'What each one means']]} />

          <section className="section" id="ph">
            <div className="section-head" data-reveal>
              <div>
                <h2>Acidic, neutral or alkaline</h2>
                <p>Most crops grow best between pH 6.0 and 7.5. Strongly acidic or alkaline soil locks up nutrients such as phosphorus, zinc and iron.</p>
              </div>
            </div>
            <div className="panel" data-reveal>
              <div style={{ position: 'relative', padding: '8px 0 0' }}>
                <div className="scale scale-ph" style={{ height: 14, borderRadius: 7 }} />
                <div className="scale-ticks">
                  {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((v) => <span key={v}>{v}</span>)}
                </div>
                <div className="scale-ticks" style={{ marginTop: 2 }}>
                  <span>Strongly acidic</span><span>Slightly acidic</span><span>Neutral</span><span>Moderately alkaline</span><span>Strongly alkaline</span>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 26 }} data-stagger>
                {sorted('ph').map((s) => (
                  <div key={s.region} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 150px', alignItems: 'center', gap: 12 }}>
                    <span className="state-cell" style={{ fontWeight: 500 }}><span className="dot" style={{ background: colorOf(s.region) }} />{regionById[s.region].name}</span>
                    <div style={{ position: 'relative', height: 22, background: 'var(--surface-2)', borderRadius: 11 }}>
                      <div style={{ position: 'absolute', left: `${((s.ph - 5) / 4) * 100}%`, top: 3, width: 16, height: 16, marginLeft: -8, borderRadius: '50%', background: colorOf(s.region), border: '3px solid var(--surface)' }} />
                    </div>
                    <span style={{ textAlign: 'right' }}><b>{fmt(s.ph, 2)}</b> <span className="sub">{phLabel(s.ph)}</span></span>
                  </div>
                ))}
              </div>
              <p className="note">West Bengal’s high-rainfall soils are the most acidic; Punjab’s are the most alkaline, which is common in irrigated, semi-arid alluvium.</p>
            </div>
          </section>

          <section className="section" id="texture">
            <div className="section-head" data-reveal>
              <div>
                <h2>Sand, silt and clay</h2>
                <p>Texture controls how much water soil holds and how easily roots spread. Clay-rich black soils of Maharashtra and Madhya Pradesh hold moisture well into the dry season.</p>
              </div>
            </div>
            <div className="grid-2">
              <div className="panel" data-reveal="left">
                <h3>Soil texture triangle</h3>
                <p className="sub" style={{ marginBottom: 8 }}>Each dot is one state. Hover for exact values.</p>
                <Ternary />
                <div className="legend">{REGIONS.map((r) => <span key={r.id}><i style={{ background: colorOf(r.id), borderRadius: '50%' }} />{ABBR[r.id]} {r.name}</span>)}</div>
              </div>
              <div className="panel" data-reveal="right" style={{ marginTop: 0 }}>
                <h3>Texture by state</h3>
                <p className="sub" style={{ marginBottom: 18 }}>Percent of the fine earth, with the USDA texture class</p>
                <div style={{ display: 'grid', gap: 16 }}>
                  {sorted('clay').map((s) => (
                    <div key={s.region}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
                        <b>{regionById[s.region].name}</b><span className="sub">{textureClass(s.sand, s.silt, s.clay)}</span>
                      </div>
                      <div className="texture-bar">
                        <div style={{ flex: s.sand, background: '#c49a5a' }}>{fmt(s.sand)}%</div>
                        <div style={{ flex: s.silt, background: '#8a7a64' }}>{fmt(s.silt)}%</div>
                        <div style={{ flex: s.clay, background: '#5a4636' }}>{fmt(s.clay)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="legend" style={{ marginTop: 14 }}>
                  <span><i style={{ background: '#c49a5a' }} />Sand</span><span><i style={{ background: '#8a7a64' }} />Silt</span><span><i style={{ background: '#5a4636' }} />Clay</span>
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="carbon">
            <div className="section-head" data-reveal>
              <div>
                <h2>Organic carbon</h2>
                <p>Organic carbon is the clearest sign of soil health: it feeds soil life, holds water and releases nutrients. Indian soil-test ratings call below 5 g/kg (0.5%) low and above 7.5 g/kg (0.75%) high.</p>
              </div>
            </div>
            <div className="panel" data-reveal>
              <div data-grow className="rank" style={{ gap: 14 }}>
                {sorted('organicCarbon').map((s) => {
                  const rating = s.organicCarbon < 5 ? 'Low' : s.organicCarbon <= 7.5 ? 'Medium' : 'High';
                  return (
                    <div className="rank-row" key={s.region} style={{ gridTemplateColumns: '150px 1fr 140px' }}>
                      <span className="state-cell" style={{ fontWeight: 500 }}><span className="dot" style={{ background: colorOf(s.region) }} />{regionById[s.region].name}</span>
                      <div className="bar" style={{ width: `${(s.organicCarbon / ocMax) * 100}%`, background: 'var(--leaf)', height: 18 }} />
                      <span className="v">{fmt(s.organicCarbon, 1)} g/kg <span className="sub">{rating}</span></span>
                    </div>
                  );
                })}
              </div>
              <p className="note">SoilGrids organic carbon is a modelled estimate for the 0–30 cm layer. Tamil Nadu and Karnataka sample points include clay-rich, higher-carbon soils; Punjab’s intensively cropped alluvium is lower.</p>
            </div>
          </section>

          <section className="section" id="table">
            <div className="section-head" data-reveal><h2>All soil properties</h2></div>
            <div className="table-scroll" data-reveal>
              <table className="data">
                <thead>
                  <tr>
                    <th>State</th><th>pH</th><th>Organic carbon <span className="unit">g/kg</span></th><th>Total nitrogen <span className="unit">g/kg</span></th>
                    <th>CEC <span className="unit">cmol(c)/kg</span></th><th>Bulk density <span className="unit">g/cm³</span></th><th>Sand %</th><th>Silt %</th><th>Clay %</th><th>Texture</th><th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {SOIL.map((s) => (
                    <tr key={s.region}>
                      <td><Link to={`/states/${s.region}`} className="state-cell" style={{ color: 'inherit', textDecoration: 'none' }}><span className="dot" style={{ background: colorOf(s.region) }} />{regionById[s.region].name}</Link></td>
                      <td>{fmt(s.ph, 2)}</td><td>{fmt(s.organicCarbon, 1)}</td><td>{fmt(s.nitrogen, 2)}</td><td>{fmt(s.cec, 1)}</td><td>{fmt(s.bulkDensity, 2)}</td>
                      <td>{fmt(s.sand, 1)}</td><td>{fmt(s.silt, 1)}</td><td>{fmt(s.clay, 1)}</td><td>{textureClass(s.sand, s.silt, s.clay)}</td><td>{s.samplePoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="photo-split">
              <PhotoReveal k="soilClose" height={480} />
              <div>
                <span className="kicker" data-reveal>Why soil matters</span>
                <h2 data-split style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}><SplitText text="Healthy soil feeds the crop long after the rain stops." /></h2>
                <p data-reveal style={{ color: 'var(--ink-2)', fontSize: '1.05rem', marginTop: 16 }}>Texture decides how much monsoon water the ground can store for the dry months, pH decides which nutrients roots can reach, and organic carbon keeps the whole system alive. Reading these numbers together explains why the same rainfall gives different harvests in different states.</p>
              </div>
            </div>
          </section>

          <section className="section" id="glossary">
            <div className="section-head" data-reveal><h2>What each property means</h2></div>
            <div className="explain" data-stagger>
              <div><h4><FlaskConical aria-hidden="true" />pH</h4><p>Acidity or alkalinity on a 0–14 scale, measured in water. 7 is neutral. It controls which nutrients plants can take up.</p></div>
              <div><h4><Leaf aria-hidden="true" />Organic carbon</h4><p>Carbon held in decomposed plant and animal matter. Higher values mean better structure, water holding and nutrient supply.</p></div>
              <div><h4><Atom aria-hidden="true" />Total nitrogen</h4><p>All nitrogen in the soil, most of it locked in organic matter. Only a small part is available to plants in a season.</p></div>
              <div><h4><Grip aria-hidden="true" />Cation exchange capacity</h4><p>How many nutrient ions such as calcium, magnesium and potassium the soil can hold. Clay and organic matter raise it.</p></div>
              <div><h4><Scale aria-hidden="true" />Bulk density</h4><p>Mass of dry soil per volume. Values above about 1.6 g/cm³ suggest compaction that can restrict root growth.</p></div>
              <div><h4><Droplet aria-hidden="true" />Texture</h4><p>The mix of sand, silt and clay particles. Sandy soils drain fast; clay soils hold water but can waterlog.</p></div>
            </div>
            <p className="note">Source: ISRIC SoilGrids 2.0, 250 m resolution, mean predictions, depth-weighted over 0–5, 5–15 and 15–30 cm. These are model estimates, not laboratory tests. <Link to="/sources">More about the data</Link></p>
          </section>
        </div>
      </div>
    </Page>
  );
}
