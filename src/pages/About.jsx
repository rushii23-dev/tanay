import { Link } from 'react-router-dom';
import { Target, CheckCircle2, CircleSlash, Rocket, FolderTree, FileWarning, BarChart3, MapPinned, Bug, Sprout } from 'lucide-react';
import { Page, PageBanner, Toc, PhotoReveal } from '../components/Page';

const OBJECTIVES = [
  'Develop a centralised agricultural analytics website.',
  'Organise and analyse weather, soil and crop-yield datasets.',
  'Provide CSV upload and data validation.',
  'Display agricultural indicators on interactive dashboards.',
  'Enable comparison across eight Indian states.',
  'Explore potential crop-disease risk from environmental conditions.',
  'Lay a foundation for future machine-learning-based disease prediction.',
];

export default function About() {
  return (
    <Page>
      <PageBanner photo="women" crumb="About the project" title="Why CropShield AI was built.">
        A B.Tech data-science project: a web-based agricultural analytics prototype that brings weather, soil and crop-yield data together
        and makes them easy to check, explore and compare.
      </PageBanner>
      <div className="page-body">
        <div className="wrap">
          <Toc items={[['background', 'Background'], ['problems', 'Problems addressed'], ['objectives', 'Objectives'], ['scope', 'Scope'], ['outcome', 'Outcome and future work']]} />

          <section className="section split" id="background">
            <div data-reveal="left">
              <span className="kicker"><Sprout aria-hidden="true" />Background</span>
              <h2>Farming runs on weather and soil.</h2>
            </div>
            <div className="prose" data-reveal="right">
              <p>
                Temperature, humidity, rainfall and soil properties shape crop growth, productivity and the spread of plant disease. Yet the data
                that describes them is published by different agencies, in different formats and at different scales, which makes it hard to
                analyse, compare and interpret together.
              </p>
              <p>
                Raw agricultural datasets also contain missing values, duplicates, inconsistent dates and mixed measurement ranges. Without
                validation, conclusions drawn from them can be wrong. CropShield AI addresses this with one platform that organises the data,
                checks it, shows it visually and offers a structured first look at disease risk.
              </p>
            </div>
          </section>

          <section className="section" id="problems">
            <div className="section-head" data-reveal><h2>Problems the project addresses</h2></div>
            <div className="problems" data-stagger>
              {[
                [FolderTree, 'Scattered data', 'Weather, soil and yield are kept in separate datasets, making combined analysis difficult.'],
                [FileWarning, 'Data quality', 'Missing values, duplicates, invalid dates and inconsistent formats affect analysis.'],
                [BarChart3, 'Limited visualisation', 'Raw tables are hard to understand without charts and summaries.'],
                [MapPinned, 'Regional comparison', 'Comparing regions needs organised data on common scales.'],
                [Bug, 'Disease-risk exploration', 'Relating temperature, humidity and rain to disease risk needs a structured approach.'],
              ].map(([Icon, t, p]) => (
                <div className="problem" key={t}><span className="ic"><Icon aria-hidden="true" /></span><h3>{t}</h3><p>{p}</p></div>
              ))}
            </div>
          </section>

          <section className="section" id="objectives">
            <div className="section-head" data-reveal><h2>Objectives</h2></div>
            <div className="objectives" data-stagger>
              {OBJECTIVES.map((o) => <div key={o}><Target aria-hidden="true" /><p>{o}</p></div>)}
            </div>
          </section>

          <section className="section" id="scope">
            <div className="section-head" data-reveal><h2>Scope</h2></div>
            <div className="grid-2">
              <div className="panel" data-reveal="left">
                <h3 style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}><CheckCircle2 aria-hidden="true" style={{ color: 'var(--good-ink)' }} />In scope</h3>
                <ul className="prose" style={{ paddingLeft: 20, gap: 8 }}>
                  <li>Eight states: Punjab, Uttar Pradesh, Maharashtra, Karnataka, Tamil Nadu, West Bengal, Gujarat, Madhya Pradesh</li>
                  <li>Monthly weather 2015–2024, topsoil properties, crop yields 2013-14 to 2022-23</li>
                  <li>CSV upload, validation and cleaning in the browser</li>
                  <li>Interactive dashboards and state comparison</li>
                  <li>Preliminary, rule-based disease-risk scores for six diseases</li>
                </ul>
              </div>
              <div className="panel" data-reveal="right" style={{ marginTop: 0 }}>
                <h3 style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}><CircleSlash aria-hidden="true" style={{ color: 'var(--critical-ink)' }} />Out of scope for this version</h3>
                <ul className="prose" style={{ paddingLeft: 20, gap: 8 }}>
                  <li>Machine-learning disease prediction (no labelled outbreak data yet)</li>
                  <li>A backend database or saving uploaded files</li>
                  <li>District-level or daily data</li>
                  <li>Field advice on spraying or fertiliser doses</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-head" data-reveal><h2>The people and places behind the data</h2></div>
            <div className="mosaic">
              {['harvesting', 'seedlings', 'womenWork', 'teaHills', 'smile', 'soilHands', 'wheatGold'].map((k) => <PhotoReveal key={k} k={k} height={200} />)}
            </div>
          </section>

          <section className="section" id="outcome">
            <div className="section-head" data-reveal>
              <div>
                <h2>Outcome and future work</h2>
                <p>The outcome is a working prototype with dataset validation, interactive visualisation, regional analysis and preliminary disease-risk exploration in one platform, built entirely on real public data.</p>
              </div>
            </div>
            <div className="explain" data-stagger>
              <div><h4><Rocket aria-hidden="true" />Finer data</h4><p>District-level weather, Soil Health Card results and district crop statistics.</p></div>
              <div><h4><Rocket aria-hidden="true" />Machine learning</h4><p>Collect labelled disease-incidence records, then train and evaluate prediction models against the rule-based baseline.</p></div>
              <div><h4><Rocket aria-hidden="true" />Backend</h4><p>A database and API so validated datasets can be stored, shared and updated.</p></div>
              <div><h4><Rocket aria-hidden="true" />Daily timing</h4><p>Daily weather and leaf-wetness estimates to time disease risk by week rather than by month.</p></div>
            </div>
            <p className="note" data-reveal>See <Link to="/method">How it works</Link> for the full method and <Link to="/sources">Data sources</Link> for every dataset.</p>
          </section>
        </div>
      </div>
    </Page>
  );
}
