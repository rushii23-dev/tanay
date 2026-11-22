import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Photo, SplitText } from './Photo';
import { useReveal, useInView, scrollToId, useGSAP, gsap, reduceMotion } from '../lib/motion';

/** Wraps a page so every [data-reveal], [data-stagger], [data-split], [data-clip], [data-parallax], [data-count] inside it animates. */
export function Page({ children, deps = [] }) {
  const ref = useRef(null);
  useReveal(ref, deps);
  return <div ref={ref}>{children}</div>;
}

export function PageBanner({ crumb, title, children, photo }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (photo) tl.fromTo('.banner-img', { scale: 1.3 }, { scale: 1.08, duration: 2.4, ease: 'power2.out' }, 0);
      tl.from('.crumbs', { autoAlpha: 0, y: 16, duration: 0.6 }, 0.2)
        .from('h1 .split-c', { yPercent: 120, rotate: 6, duration: 1, stagger: 0.025, ease: 'power4.out' }, 0.3)
        .from('p.lead', { autoAlpha: 0, y: 24, duration: 0.8 }, 0.75)
        .from('.banner-rule', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power4.inOut' }, 0.5);
      if (photo) {
        gsap.to('.banner-media', { yPercent: 22, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.banner-inner', { yPercent: -30, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } });
      }
    },
    { scope: ref },
  );
  return (
    <header className={`page-banner ${photo ? 'has-photo' : ''}`} ref={ref}>
      {photo && (
        <>
          <div className="banner-media"><Photo k={photo} eager className="banner-img" /></div>
          <div className="banner-shade" />
        </>
      )}
      <div className="wrap banner-inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight aria-hidden="true" />
          <span>{crumb}</span>
        </nav>
        <h1><SplitText text={title} by="char" /></h1>
        <span className="banner-rule" aria-hidden="true" />
        {children && <p className="lead">{children}</p>}
      </div>
    </header>
  );
}

/** Jump links for long pages (HashRouter owns # in the URL, so these scroll with JS). */
export function Toc({ items }) {
  return (
    <nav className="toc" aria-label="On this page" data-stagger>
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToId(id); }}>
          {label}
        </a>
      ))}
    </nav>
  );
}

/** Reserves space and mounts a chart when it scrolls into view so its draw animation is seen. */
export function InView({ height, children }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{ minHeight: height }}>
      {seen ? children : null}
    </div>
  );
}

/** Large photo that wipes in on scroll and drifts with parallax. */
export function PhotoReveal({ k, height = 520, className = '' }) {
  return (
    <figure className={`photo-reveal ${className}`} data-clip style={{ height }}>
      <div className="pr-inner" data-parallax="8"><Photo k={k} sizes="(max-width: 900px) 100vw, 50vw" /></div>
    </figure>
  );
}
