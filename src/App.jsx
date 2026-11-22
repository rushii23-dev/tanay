import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {
  Menu, X, Moon, Sun, ChevronDown, MapPinned, CloudRain, Layers, Wheat, GitCompareArrows, FileCheck2, Bug, BookOpenText,
  Workflow, Database, Info,
} from 'lucide-react';
import { Logo } from './components/ui';
import { ScrollProgress, Cursor, RouteCurtain } from './components/Effects';
import { gsap, ScrollTrigger, reduceMotion } from './lib/motion';
import Home from './pages/Home';
import StatesIndex from './pages/StatesIndex';
import StatePage from './pages/StatePage';
import Weather from './pages/Weather';
import Soil from './pages/Soil';
import Yields from './pages/Yields';
import Compare from './pages/Compare';
import Validate from './pages/Validate';
import Risk from './pages/Risk';
import Diseases from './pages/Diseases';
import Method from './pages/Method';
import Sources from './pages/Sources';
import About from './pages/About';

const NAV = [
  {
    label: 'Explore',
    items: [
      ['/states', 'States', 'Profiles of all eight farming states', MapPinned],
      ['/weather', 'Weather', 'Rainfall, temperature and humidity', CloudRain],
      ['/soil', 'Soil', 'pH, carbon, nutrients and texture', Layers],
      ['/yields', 'Crop yields', 'Ten years of official harvest data', Wheat],
      ['/compare', 'Compare', 'Put any states side by side', GitCompareArrows],
    ],
  },
  {
    label: 'Tools',
    items: [
      ['/validate', 'Check a dataset', 'Find and fix problems in a CSV', FileCheck2],
      ['/risk', 'Disease risk', 'Score conditions for six diseases', Bug],
      ['/diseases', 'Disease library', 'Causes, signs and risky months', BookOpenText],
    ],
  },
  {
    label: 'Project',
    items: [
      ['/method', 'How it works', 'From raw data to risk score', Workflow],
      ['/sources', 'Data sources', 'Where every number comes from', Database],
      ['/about', 'About the project', 'Problem, objectives and scope', Info],
    ],
  },
];

function useTheme() {
  const initial = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [theme, setTheme] = useState(initial);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* not persisted */ }
    setTheme(next);
  };
  return [theme, toggle];
}

const canHover = () => window.matchMedia('(hover: hover) and (min-width: 981px)').matches;

function NavGroup({ group, pathname, openGroup, setOpenGroup, close }) {
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const open = openGroup === group.label;
  const active = group.items.some(([to]) => pathname === to || (to === '/states' && pathname.startsWith('/states')));
  return (
    <div
      className="nav-group"
      data-label={group.label}
      onMouseEnter={() => { clearTimeout(closeTimer.current); if (canHover()) setOpenGroup(group.label); }}
      onMouseLeave={() => { if (!canHover()) return; clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenGroup((g) => (g === group.label ? null : g)), 260); }}
    >
      <button
        className={`nav-trigger ${active ? 'active' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        // On hover devices the menu is already open from hovering, so a click keeps it open instead of toggling it shut.
        onClick={() => setOpenGroup(canHover() ? group.label : open ? null : group.label)}
      >
        {group.label}
        <ChevronDown aria-hidden="true" />
      </button>
      {(open || null) && (
        <div className="nav-menu">
          {group.items.map(([to, label, desc, Icon]) => (
            <NavLink key={to} to={to} onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon aria-hidden="true" />
              <b>{label}</b>
              <small>{desc}</small>
            </NavLink>
          ))}
        </div>
      )}
      <div className="nav-menu mobile-only">
        {group.items.map(([to, label, desc, Icon]) => (
          <NavLink key={to} to={to} onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon aria-hidden="true" />
            <b>{label}</b>
            <small>{desc}</small>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const on = () => setAtTop(window.scrollY < 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.__lenis = null; };
  }, []);

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [pathname]);

  // close desktop menus on outside click / Escape
  useEffect(() => {
    const onDoc = (e) => { if (headerRef.current && !headerRef.current.contains(e.target)) setOpenGroup(null); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpenGroup(null); setOpen(false); } };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onDoc); document.removeEventListener('keydown', onKey); };
  }, []);

  const close = () => { setOpen(false); setOpenGroup(null); };

  return (
    <>
      <ScrollProgress />
      <RouteCurtain />
      <Cursor />
      <header className={`site-header ${atTop && !open ? 'is-top' : ''}`} ref={headerRef}>
        <div className="wrap">
          <Link to="/" className="brand" aria-label="CropShield AI home" onClick={close}>
            <Logo />
            CropShield AI
          </Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            <NavLink to="/" end className={({ isActive }) => `nav-home ${isActive ? 'active' : ''}`} onClick={close}>Home</NavLink>
            {NAV.map((g) => (
              <NavGroup key={g.label} group={g} pathname={pathname} openGroup={openGroup} setOpenGroup={setOpenGroup} close={close} />
            ))}
            <Link to="/risk" className="btn btn-primary nav-cta" onClick={close} style={{ padding: '9px 18px', color: 'var(--indigo-ink)' }}>
              Check disease risk
            </Link>
          </nav>
          <button className="icon-btn theme-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to day theme' : 'Switch to night theme'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/states" element={<StatesIndex />} />
          <Route path="/states/:id" element={<StatePage />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/soil" element={<Soil />} />
          <Route path="/yields" element={<Yields />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/validate" element={<Validate />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/method" element={<Method />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer band">
      <div className="wrap footer-grid">
        <div>
          <Link to="/" className="brand" style={{ color: 'var(--band-ink)' }}><Logo />CropShield AI</Link>
          <p style={{ marginTop: 14 }}>
            An academic agricultural-analytics prototype for eight Indian states. Weather from NASA POWER, soil from ISRIC SoilGrids, crop yields
            from the Ministry of Agriculture and Farmers Welfare. Disease-risk scores are rule-based estimates, not forecasts.
          </p>
        </div>
        {NAV.map((g) => (
          <div key={g.label}>
            <h4>{g.label}</h4>
            <ul>
              {g.items.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
