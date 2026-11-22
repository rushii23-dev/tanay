import { Fragment } from 'react';
import { PHOTOS, photoUrl, srcSet } from '../lib/photos';

/** Responsive Unsplash photo. `sizes` defaults to full width. */
export function Photo({ k, className = '', sizes = '100vw', eager = false, style, ...rest }) {
  const p = PHOTOS[k];
  return (
    <img
      className={className}
      src={photoUrl(k, 1600)}
      srcSet={srcSet(k)}
      sizes={sizes}
      alt={p.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
      {...rest}
    />
  );
}

/** Splits text into per-character (or per-word) spans for staggered reveals. */
export function SplitText({ text, by = 'word', className = '' }) {
  const words = text.split(' ');
  return (
    <span className={`splittext ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split-w" aria-hidden="true">
            {by === 'char'
              ? [...w].map((c, j) => <span className="split-c" key={j}>{c}</span>)
              : <span className="split-c">{w}</span>}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  );
}
