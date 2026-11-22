import { Fragment, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, FolderTree, FileWarning, BarChart3, MapPinned, Bug, FileCheck2, GitCompareArrows, Satellite, Layers, Landmark, CloudRain, Wheat,
} from 'lucide-react';
import { Photo, SplitText } from '../components/Photo';
import { Leaves } from '../components/Effects';
import StateRows from '../components/StateRows';
import MonsoonStripes from '../components/MonsoonStripes';
import { Page, PhotoReveal } from '../components/Page';
import { gsap, useGSAP, reduceMotion, scrollToId } from '../lib/motion';
import {
  REGIONS, summary, fmt, WEATHER, YIELDS, seasonalRain, yieldValue, regionById,
} from '../lib/data';
import { DISEASES } from '../lib/risk';

const SLIDES = ['ploughing', 'transplanting', 'wheatSunset', 'monsoon'];

function Hero() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.from('.slides', { autoAlpha: 0, duration: 1.4 }, 0)
        .from('.hero-tag', { autoAlpha: 0, y: 20, duration: 0.7 }, 0.4)
        .from('h1 .split-c', { yPercent: 120, rotate: 8, duration: 1.1, stagger: 0.025, ease: 'power4.out' }, 0.5)
        .from('.lead', { autoAlpha: 0, y: 26, duration: 0.9 }, 1.1)
        .from('.hero-actions > *', { autoAlpha: 0, y: 24, scale: 0.9, stagger: 0.12, duration: 0.8, ease: 'back.out(1.8)' }, 1.25)
        .from('.hero-meta, .scroll-cue', { autoAlpha: 0, duration: 0.8 }, 1.6);

      // crossfading slideshow with a slow Ken Burns zoom on every photo
      const slides = gsap.utils.toArray('.slide', ref.current);
      const dots = gsap.utils.toArray('.hero-dots i', ref.current);
      const HOLD = 6;
      let i = 0;
      let alive = true;
      let pending = null;
      gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
      gsap.set(slides[0], { autoAlpha: 1, zIndex: 1 });
      const play = () => {
        if (!alive) return;
        const cur = slides[i];
        setActive(i);
        gsap.fromTo(cur.querySelector('img'), { scale: 1.2, xPercent: i % 2 ? -3 : 3 }, { scale: 1.02, xPercent: 0, duration: HOLD + 1.6, ease: 'none' });
        gsap.fromTo(dots[i], { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: 'none' });
        pending = gsap.delayedCall(HOLD - 1.2, () => {
          if (!alive) return;
          const ni = (i + 1) % slides.length;
          gsap.set(slides[ni], { zIndex: 2 });
          gsap.set(cur, { zIndex: 1 });
          gsap.fromTo(slides[ni], { autoAlpha: 0 }, {
            autoAlpha: 1, duration: 1.4, ease: 'power1.inOut',
            onComplete: () => { gsap.set(cur, { autoAlpha: 0, zIndex: 0 }); gsap.set(dots[i], { scaleX: 0 }); i = ni; play(); },
          });
        });
      };
      play();

      // scroll: photo sinks, text lifts away, drawn hills rise
      gsap.to('.slides', { yPercent: 18, scale: 1.05, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-inner', { y: -160, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: '70% top', scrub: true } });
      return () => {
        alive = false;
        pending?.kill();
        gsap.killTweensOf([...slides, ...dots, ...slides.map((s) => s.querySelector('img'))]);
      };
    },
    { scope: ref },
  );
  return (
    <section className="hero-photo" ref={ref}>
      <div className="slides">
        {SLIDES.map((k, i) => (
          <div className="slide" key={k}><Photo k={k} eager={i === 0} fetchPriority={i === 0 ? 'high' : 'auto'} /></div>
        ))}
      </div>
      <div className="shade" />
      <Leaves />
      <div className="wrap hero-inner">
        <span className="hero-tag"><i><Sprout aria-hidden="true" /></i>Real public data for 8 Indian farming states</span>
        <h1><SplitText text="Every harvest begins with weather and soil." by="char" /></h1>
        <p className="lead">
          CropShield AI brings ten years of monthly weather, topsoil measurements and official crop yields into one place, so you can see how
          growing conditions shape harvests and when the weather turns in favour of crop disease.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg magnetic" to="/states">Explore the states</Link>
          <Link className="btn btn-light btn-lg magnetic" to="/risk">Check disease risk</Link>
        </div>
      </div>
      <div className="hero-meta">
        <span className="hero-count">{String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</span>
        <div className="hero-dots">{SLIDES.map((k) => <button key={k} aria-label={`Photo ${k}`} tabIndex={-1}><i /></button>)}</div>
      </div>
      <a className="scroll-cue" href="#stats" onClick={(e) => { e.preventDefault(); scrollToId('stats'); }}>
        <span className="mouse" aria-hidden="true" />
        Scroll to explore
      </a>
    </section>
  );
}

const MARQUEE = ['harvesting', 'seedlings', 'wheatSky', 'tractor', 'standing', 'rainPlanting', 'womenWork', 'teaHills', 'smile', 'cropRows', 'palms', 'soilClose'];

function PhotoMarquee() {
  const tiles = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" style={{ '--dur': '70s' }} aria-label="Photographs of Indian farms">
      <div className="marquee-track">
        {tiles.map((k, i) => (
          <div className="tile" key={i} aria-hidden={i >= MARQUEE.length}>
            <Photo k={k} sizes="320px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WordMarquee() {
  const words = ['Rice', 'Wheat', 'Pulses', 'Sugarcane', 'Cotton', 'Oilseeds', 'Maize', 'Millets'];
  const all = [...words, ...words];
  return (
    <div className="marquee marquee-words reverse" style={{ '--dur': '40s' }} aria-hidden="true">
      <div className="marquee-track">
        {all.map((w, i) => (
          <Fragment key={i}>
            <span className={`w ${i % 3 === 1 ? 'fill' : ''}`}>{w}</span>
            <Wheat />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Pipeline() {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const track = ref.current.querySelector('.pipeline');
        const dist = () => track.scrollWidth - ref.current.querySelector('.pipeline-wrap').clientWidth;
        gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  const steps = [
    ['Collect', 'Monthly weather from NASA POWER, topsoil properties from ISRIC SoilGrids and state yields from the Ministry of Agriculture.', ['960 weather records', '8 soil profiles', '526 yield figures']],
    ['Validate', 'Every dataset passes the same checks before use: missing values, duplicates, invalid dates, wrong types and impossible readings.', ['11 automatic checks', 'Cleaned copy you can download']],
    ['Integrate', 'Weather, soil and yield are aligned on state and time, units are standardised and depth layers are averaged.', ['Region + month + year keys', '0–30 cm depth-weighted soil']],
    ['Visualise', 'Interactive charts turn the tables into patterns you can read: seasons, extremes, trends and rankings.', ['State profiles', 'Side-by-side comparison']],
    ['Assess risk', 'A transparent rule-based score shows how closely the weather matches conditions that favour six crop diseases.', ['Scores from 0 to 100', 'Every step of the sum shown']],
  ];
  return (
    <section className="band" ref={ref} style={{ overflow: 'hidden' }}>
      <div className="wrap story" style={{ paddingBottom: 80 }}>
        <div className="story-head" data-reveal>
          <span className="kicker"><Sprout aria-hidden="true" />How it works</span>
          <h2 data-split><SplitText text="From scattered files to a clear picture, in five steps." /></h2>
        </div>
        <div className="pipeline-wrap">
          <div className="pipeline">
            {steps.map(([t, p, list], i) => (
              <article className="pipe-step" key={t}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3>
                <p>{p}</p>
                <ul>{list.map((x) => <li key={x}>{x}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
        <p className="note" style={{ marginTop: 28 }}><Link to="/method">Read the full method</Link></p>
      </div>
    </section>
  );
}

export default function Home() {
  const nav = useNavigate();
  const wb = summary('west-bengal').annualRain;
  const pb = summary('punjab').annualRain;
  const tn = seasonalRain('tamil-nadu');
  const pbWheat = yieldValue('punjab', 'wheat', '2022-23')?.value;
  const inWheat = yieldValue('india', 'wheat', '2022-23')?.value;

  return (
    <Page>
      <Hero />

      <section className="band" id="stats">
        <div className="wrap stat-band" data-stagger>
          <div className="stat"><b data-count="8">8</b><span>farming states covered</span></div>
          <div className="stat"><b data-count="10">10</b><span>years of monthly weather</span></div>
          <div className="stat"><b data-count={WEATHER.length}>{fmt(WEATHER.length)}</b><span>weather records</span></div>
          <div className="stat"><b data-count={YIELDS.length}>{fmt(YIELDS.length)}</b><span>official yield figures</span></div>
          <div className="stat"><b data-count={DISEASES.length}>{DISEASES.length}</b><span>crop diseases assessed</span></div>
        </div>
      </section>

      <PhotoMarquee />

      <section className="story">
        <div className="wrap">
          <div className="story-head" data-reveal>
            <span className="kicker"><FolderTree aria-hidden="true" />The problem</span>
            <h2 data-split><SplitText text="Farm data exists. Using it together is the hard part." /></h2>
            <p>
              Weather, soil and harvest records are kept by different agencies, in different formats and at different scales. Before anyone can ask
              how rainfall relates to yield or disease, the data has to be found, checked, cleaned and lined up.
            </p>
          </div>
          <div className="problems" data-stagger>
            {[
              [FolderTree, 'Scattered data', 'Weather, soil and yield sit in separate datasets from separate sources.'],
              [FileWarning, 'Quality problems', 'Missing values, duplicates, invalid dates and mixed units creep into raw files.'],
              [BarChart3, 'Hard to read', 'Thousands of rows of numbers hide the seasonal patterns inside them.'],
              [MapPinned, 'Regions differ', 'Comparing states needs the same measures, on the same scale, side by side.'],
              [Bug, 'Disease risk is unclear', 'How temperature, humidity and rain favour disease is rarely laid out plainly.'],
            ].map(([Icon, t, p]) => (
              <div className="problem" key={t}>
                <span className="ic"><Icon aria-hidden="true" /></span>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <div className="photo-split" style={{ marginTop: 90 }}>
            <PhotoReveal k="farmerField" height={560} />
            <div>
              <span className="kicker" data-reveal><Sprout aria-hidden="true" />Our approach</span>
              <h2 data-split style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.035em', lineHeight: 1.02 }}><SplitText text="One platform from raw file to clear answer." /></h2>
              <p data-reveal style={{ color: 'var(--ink-2)', fontSize: '1.08rem', marginTop: 18 }}>
                CropShield AI collects the three kinds of data, checks every row, lines the datasets up by state and time, and shows them as
                charts anyone can read. A transparent, rule-based score then shows when the weather favours common crop diseases.
              </p>
              <div className="hero-actions" data-reveal style={{ marginTop: 26 }}>
                <Link className="btn btn-primary magnetic" to="/method">See how it works</Link>
                <Link className="btn btn-quiet magnetic" to="/validate">Check a dataset</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="story tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="story-head" data-reveal>
            <span className="kicker"><CloudRain aria-hidden="true" />A decade of monsoon</span>
            <h2 data-split><SplitText text="120 months of rain, eight states, one picture." /></h2>
            <p>Each stripe is one month from 2015 to 2024. The darker the blue, the more rain fell. Hover a stripe for the exact figures.</p>
          </div>
          <div data-reveal="scale"><MonsoonStripes /></div>
        </div>
      </section>

      <section className="story">
        <div className="wrap">
          <div className="story-head" data-reveal>
            <span className="kicker"><BarChart3 aria-hidden="true" />What the data shows</span>
            <h2 data-split><SplitText text="Same country, very different farms." /></h2>
          </div>
          <div className="insights" data-stagger>
            <div className="insight green">
              <span className="big"><span data-count={(wb / pb).toFixed(1)} data-decimals="1">{(wb / pb).toFixed(1)}</span><small>×</small></span>
              <h3>West Bengal gets far more rain than Punjab</h3>
              <p>{fmt(wb)} mm a year against {fmt(pb)} mm. Punjab makes up the difference with canals and tube wells.</p>
            </div>
            <div className="insight wheat">
              <span className="big"><span data-count={Math.round(tn.postPct)}>{Math.round(tn.postPct)}</span><small>%</small></span>
              <h3>Tamil Nadu’s rain comes late</h3>
              <p>That share of its yearly rain falls in October–December, from the north-east monsoon, when most of India is drying out.</p>
            </div>
            <div className="insight">
              <span className="big"><span data-count={Math.round(((pbWheat - inWheat) / inWheat) * 100)}>{Math.round(((pbWheat - inWheat) / inWheat) * 100)}</span><small>% higher</small></span>
              <h3>Punjab’s wheat yield beats the national average</h3>
              <p>{fmt(pbWheat)} kg per hectare in 2022-23 against {fmt(inWheat)} kg for All India.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="story" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="section-head" data-reveal>
            <div className="story-head" style={{ marginBottom: 0 }}>
              <span className="kicker"><MapPinned aria-hidden="true" />The eight states</span>
              <h2 data-split><SplitText text="Pick a state to see its full profile." /></h2>
            </div>
            <Link className="btn btn-quiet" to="/compare">Compare states</Link>
          </div>
          <StateRows />
        </div>
      </section>

      <WordMarquee />

      <section className="statement">
        <div className="bg" data-parallax="10"><Photo k="transplanting" /></div>
        <div className="wrap">
          <h2 data-split><SplitText text="Behind every number is a field, a season and a farmer." /></h2>
          <p data-reveal>The charts on this site are built from public records. The people in these photographs are why those records matter.</p>
        </div>
      </section>

      <Pipeline />

      <section className="story">
        <div className="wrap">
          <div className="story-head" data-reveal>
            <span className="kicker"><FileCheck2 aria-hidden="true" />Tools</span>
            <h2 data-split><SplitText text="Three ways to work with the data." /></h2>
          </div>
          <div className="tools" data-stagger>
            <Link className="tool" to="/validate">
              <FileCheck2 aria-hidden="true" />
              <h3>Check a dataset</h3>
              <p>Upload a weather, soil or yield CSV. Find missing values, duplicates, invalid dates and impossible readings, then download a cleaned copy.</p>
              <span className="go">Check a CSV file</span>
            </Link>
            <Link className="tool" to="/compare">
              <GitCompareArrows aria-hidden="true" />
              <h3>Compare states</h3>
              <p>Put any of the eight states on one chart: monthly weather, yearly rainfall, soil properties and ten years of yields.</p>
              <span className="go">Open comparison</span>
            </Link>
            <Link className="tool" to="/risk">
              <Bug aria-hidden="true" />
              <h3>Estimate disease risk</h3>
              <p>Set temperature, humidity and rainfall, or load a state’s real averages, to score rice blast, wheat rusts, late blight and more.</p>
              <span className="go">Estimate risk</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="story tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="story-head" data-reveal>
            <span className="kicker"><Landmark aria-hidden="true" />Trusted sources</span>
            <h2 data-split><SplitText text="Every number is real and traceable." /></h2>
          </div>
          <div className="source-cards" data-stagger>
            <div className="source-card">
              <span className="ic"><Satellite aria-hidden="true" /></span>
              <h3>NASA POWER</h3>
              <p>Monthly temperature, humidity and rainfall from NASA’s MERRA-2 reanalysis, 2015–2024.</p>
              <span className="meta">{fmt(WEATHER.length)} records</span>
            </div>
            <div className="source-card">
              <span className="ic"><Layers aria-hidden="true" /></span>
              <h3>ISRIC SoilGrids 2.0</h3>
              <p>Global 250 m maps of soil pH, organic carbon, nitrogen, texture and more, for 0–30 cm.</p>
              <span className="meta">{REGIONS.length} state profiles</span>
            </div>
            <div className="source-card">
              <span className="ic"><Landmark aria-hidden="true" /></span>
              <h3>Ministry of Agriculture</h3>
              <p>State-wise crop yields for six crop groups, 2013-14 to 2022-23, published in the RBI Handbook of Statistics.</p>
              <span className="meta">{fmt(YIELDS.length)} figures</span>
            </div>
          </div>
          <p className="note" style={{ marginTop: 20 }}><Link to="/sources">See every source in detail</Link></p>
        </div>
      </section>

      <section className="cta-field statement">
        <div className="bg" data-parallax="10"><Photo k="wheatGold" /></div>
        <div className="wrap" data-reveal>
          <h2 data-split><SplitText text="Start with the state you know best." /></h2>
          <p>Open its climate, soil and harvest profile, then see which months put its crops at risk.</p>
          <div className="hero-actions">
            <select className="select" aria-label="Choose a state" defaultValue="" onChange={(e) => e.target.value && nav(`/states/${e.target.value}`)} style={{ borderRadius: 999, padding: '13px 40px 13px 18px' }}>
              <option value="" disabled>Choose a state</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{regionById[r.id].name}</option>)}
            </select>
            <Link className="btn btn-primary btn-lg magnetic" to="/states">See all states</Link>
          </div>
        </div>
      </section>
    </Page>
  );
}
