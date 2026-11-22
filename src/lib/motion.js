import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
export { gsap, ScrollTrigger, useGSAP };

export const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll-triggered reveals inside `scope`:
 *   data-reveal            fade + rise   (values: up | left | right | scale)
 *   data-stagger           children reveal one after another
 *   data-count="1234"      number counts up from 0 (data-decimals="1" for decimals)
 */
export function useReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (reduceMotion()) return;
      const q = (sel) => gsap.utils.toArray(sel, scope.current);
      q('[data-reveal]').forEach((el) => {
        const k = el.dataset.reveal;
        const from = k === 'left' ? { x: -70 } : k === 'right' ? { x: 70 } : k === 'scale' ? { scale: 0.9 } : { y: 56 };
        gsap.fromTo(el, { autoAlpha: 0, ...from }, {
          autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
      q('[data-stagger]').forEach((group) => {
        gsap.fromTo(group.children, { autoAlpha: 0, y: 40 }, {
          autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: group, start: 'top 86%', once: true },
        });
      });
      // headline words / letters rising out of a mask
      q('[data-split]').forEach((el) => {
        const chars = el.querySelectorAll('.split-c');
        gsap.fromTo(chars, { yPercent: 115, rotate: 4 }, {
          yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: chars.length > 30 ? 0.015 : 0.05,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });
      // photos wiped in from the bottom while the image settles from a zoom
      q('[data-clip]').forEach((el) => {
        const img = el.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: 'power4.inOut' });
        if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0);
      });
      // scroll-linked parallax
      q('[data-parallax]').forEach((el) => {
        const s = Number(el.dataset.parallax || 12);
        gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      // gentle floating
      q('[data-float]').forEach((el, i) => {
        gsap.to(el, { y: -14, rotate: i % 2 ? 2 : -2, duration: 2.6 + (i % 3) * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      // grow bars / lines horizontally
      q('[data-grow]').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('.bar, .grow'), { scaleX: 0, transformOrigin: 'left center' }, {
          scaleX: 1, duration: 1.2, ease: 'power3.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // pointer effects (desktop only)
      const cleanups = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        q('[data-tilt]').forEach((el) => {
          const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
          const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
          gsap.set(el, { transformPerspective: 900 });
          const move = (e) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 12);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
          };
          const leave = () => { rx(0); ry(0); };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', leave);
          cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
        });
        q('.magnetic').forEach((el) => {
          const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
          const move = (e) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - r.left - r.width / 2) * 0.35);
            y((e.clientY - r.top - r.height / 2) * 0.35);
          };
          const leave = () => { x(0); y(0); };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', leave);
          cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
        });
      }

      q('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const dec = Number(el.dataset.decimals || 0);
        const fmt = (v) => v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const o = { v: 0 };
        el.textContent = fmt(0);
        gsap.to(o, {
          v: end, duration: 1.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => { el.textContent = fmt(o.v); },
        });
      });
      return () => cleanups.forEach((f) => f());
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  );
}

/** Mounts children only once they scroll into view, so chart animations play when seen. */
export function useInView(margin = '0px 0px -12% 0px') {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (seen || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen];
}

/** Smooth-scroll to an element id (works with HashRouter, where #anchors are taken by routes). */
export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -84 });
  else el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
}
