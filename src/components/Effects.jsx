// Site-wide motion: scroll progress bar, custom cursor and a leaf-green curtain between pages.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, reduceMotion } from '../lib/motion';

export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const st = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => gsap.set(ref.current, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

export function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    if (reduceMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.12 });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.12 });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = (e) => {
      const hot = e.target.closest('a, button, select, input, [role="button"], .cell');
      ring.current.classList.toggle('hot', !!hot);
    };
    const down = () => ring.current.classList.add('down');
    const up = () => ring.current.classList.remove('down');
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}

export function RouteCurtain() {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduceMotion()) return;
    const el = ref.current;
    gsap.timeline()
      .set(el, { display: 'block', scaleY: 1, transformOrigin: 'top' })
      .to(el.querySelector('.leafmark'), { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.25 }, 0)
      .to(el.querySelector('.leafmark'), { autoAlpha: 0, scale: 0.6, duration: 0.25 }, 0.3)
      .to(el, { scaleY: 0, duration: 0.7, ease: 'power4.inOut' }, 0.25)
      .set(el, { display: 'none' });
  }, [pathname]);
  return (
    <div className="route-curtain" ref={ref} aria-hidden="true">
      <svg className="leafmark" viewBox="0 0 32 32">
        <path d="M16 2.5 4.5 7v8.2c0 7 4.8 12.4 11.5 14.3 6.7-1.9 11.5-7.3 11.5-14.3V7L16 2.5Z" fill="var(--wheat)" />
      </svg>
    </div>
  );
}

/** Drifting leaves for the hero. */
export function Leaves({ count = 14 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduceMotion()) return undefined;
    const leaves = ref.current.querySelectorAll('.leaf');
    const tweens = [];
    leaves.forEach((leaf, i) => {
      const w = ref.current.clientWidth;
      const h = ref.current.clientHeight;
      const loop = () => {
        gsap.set(leaf, { x: Math.random() * w * 0.3 - 80, y: Math.random() * h * 0.8, rotate: Math.random() * 360, autoAlpha: 0 });
        tweens.push(gsap.timeline({ onComplete: loop })
          .to(leaf, { autoAlpha: 0.9, duration: 1 }, 0)
          .to(leaf, { x: `+=${w * (0.6 + Math.random() * 0.6)}`, y: `+=${(Math.random() - 0.3) * 260}`, rotate: `+=${200 + Math.random() * 400}`, duration: 9 + Math.random() * 8, ease: 'sine.inOut' }, 0)
          .to(leaf, { autoAlpha: 0, duration: 1.2 }, '-=1.2'));
      };
      tweens.push(gsap.delayedCall(i * 0.9, loop));
    });
    return () => { tweens.forEach((t) => t.kill()); gsap.killTweensOf(leaves); };
  }, []);
  return (
    <div className="leaves" ref={ref} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <svg className="leaf" key={i} viewBox="0 0 24 24" style={{ width: 14 + (i % 4) * 6 }}>
          <path d="M3 21C3 11 9 4 21 3c-1 12-8 18-18 18Z" fill={i % 3 === 0 ? 'var(--wheat)' : i % 3 === 1 ? '#7cbf5e' : '#4c8f3a'} />
          <path d="M3 21 15 9" stroke="rgb(0 0 0 / 0.25)" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
}
