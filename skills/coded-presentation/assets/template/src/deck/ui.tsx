import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import gsap from 'gsap';
import type { SlideDef } from '../slides/types';

/** Non-breaking space: keeps a number and its unit together ("1.1 million", "25 min"). */
export const NB = ' ';

/** Locale used by `fmt()` and `Num` to format numbers (thousands separator, decimal mark). */
export const LOCALE = 'en-US';

/** Current step of the slide. It is -1 just before entry, so that everything animates on arrival. */
const StepCtx = createContext(0);
export const useStep = () => useContext(StepCtx);

export function SlideShell({ def, step }: { def: SlideDef; step: number }) {
  const [live, setLive] = useState(false);
  useEffect(() => {
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setLive(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, []);
  const s = live ? step : -1;
  return (
    <StepCtx.Provider value={s}>
      <section className={`slide slide-${def.id}`} data-step={s}>
        {def.render(s)}
      </section>
    </StepCtx.Provider>
  );
}

type RevealProps = {
  /** Step at which the element appears. */
  at?: number;
  /** Step at which it disappears. */
  until?: number;
  delay?: number;
  fx?: 'rise' | 'fade' | 'pop' | 'left';
  as?: 'div' | 'span' | 'p' | 'li';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** Reveals its content at a given step. */
export function R({ at = 0, until, delay = 0, fx = 'rise', as: Tag = 'div', className = '', style, children }: RevealProps) {
  const step = useStep();
  const gone = until !== undefined && step >= until;
  const on = step >= at && !gone;
  return (
    <Tag
      className={`r r-${fx} ${on ? 'on' : ''} ${gone ? 'gone' : ''} ${className}`}
      style={{ ...style, transitionDelay: on ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}

type WordsProps = {
  text: string;
  at?: number;
  until?: number;
  delay?: number;
  stagger?: number;
  as?: 'div' | 'h1' | 'h2' | 'p' | 'span';
  className?: string;
  /** Class applied to each word (color gradients). */
  wordClass?: string;
  /** Words to color orange (g-hot gradient), written exactly as they appear in the text. */
  accent?: string[];
};

/** Title revealed word by word, each word rising out of a mask. A "\n" in the text forces a line break. */
export function Words({ text, at = 0, until, delay = 0, stagger = 70, as: Tag = 'div', className = '', wordClass = '', accent }: WordsProps) {
  const step = useStep();
  const gone = until !== undefined && step >= until;
  const on = step >= at && !gone;
  const words = text.replace(/\n/g, ' \n').split(' ');
  return (
    <Tag className={`words ${on ? 'on' : ''} ${gone ? 'gone' : ''} ${className}`} aria-label={text.replace(/\n/g, ' ')}>
      {words.map((raw, i) => {
        const breakBefore = raw.startsWith('\n');
        const w = breakBefore ? raw.slice(1) : raw;
        return (
          <span key={i} aria-hidden="true">
            {breakBefore && <br />}
            <span className="w">
              <span className={`wi ${accent?.includes(w) ? 'g-hot' : wordClass}`} style={{ transitionDelay: on ? `${delay + i * stagger}ms` : '0ms' }}>
                {w}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </Tag>
  );
}

const formats = new Map<number, Intl.NumberFormat>();
/** Formats a number in the deck's locale, with a fixed number of decimals. */
export function fmt(v: number, decimals = 0) {
  let f = formats.get(decimals);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    formats.set(decimals, f);
  }
  // Some locales (fr-FR, for instance) group thousands with a narrow no-break space (U+202F),
  // which most fonts lack: depending on the machine it renders wide, narrow or not at all.
  // It is replaced with the ordinary no-break space, which the deck's font does have.
  return f.format(v).replace(/ /g, ' ');
}

type NumProps = {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Actual width of each digit 0 to 9 in the element's font, in em.
 * Measured against a 1 em box, which cancels out the frame's scaling.
 */
function digitWidths(el: HTMLElement) {
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap';
  probe.innerHTML = '<span style="display:inline-block;width:1em"></span>' + [...'0123456789'].map((d) => `<span style="display:inline-block">${d}</span>`).join('');
  el.appendChild(probe);
  const [unit, ...digits] = Array.from(probe.children).map((c) => c.getBoundingClientRect().width);
  el.removeChild(probe);
  return unit ? digits.map((w) => w / unit) : null;
}

/**
 * A number that counts up (or down) to its new value when `value` changes.
 * Each digit sits in a fixed-width box, so the number doesn't jitter while it counts.
 */
export function Num({ value, decimals = 0, duration = 1.5, prefix = '', suffix = '', className = '' }: NumProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const cur = useRef(value);
  // First-render content, frozen: React must not rewrite the number every time the slide re-renders.
  const first = useRef<{ __html: string } | null>(null);
  /*
   * Each digit sits in a fixed-width box, so the number doesn't jitter while it counts.
   * The box takes the width of the final digit at the same position: once it lands, the number has
   * the font's natural spacing (no gap around a "1"), with no jump at the end of the count.
   * In locales that group thousands with a space, that space becomes a narrow fixed-width box.
   */
  const html = (v: number, widths: number[] | null) => {
    const target = fmt(value, decimals).replace(/\D/g, '');
    const text = (prefix + fmt(v, decimals) + suffix).replace(/(\d) (?=\d)/g, '$1<b></b>');
    const count = (text.match(/\d/g) ?? []).length;
    let i = 0;
    return text.replace(/\d/g, (d) => {
      const fromRight = count - 1 - i++;
      const final = target[target.length - 1 - fromRight];
      return widths && final !== undefined ? `<i style="width:${widths[+final].toFixed(4)}em">${d}</i>` : `<i>${d}</i>`;
    });
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let widths = digitWidths(el);
    const o = { v: cur.current };
    const write = () => {
      cur.current = o.v;
      el.innerHTML = html(o.v, widths);
    };
    // Fonts may arrive after mount: measure again once they have loaded.
    let live = true;
    if (document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => {
        if (!live) return;
        widths = digitWidths(el);
        write();
      });
    }
    if (o.v === value) {
      write();
      return () => {
        live = false;
      };
    }
    const tw = gsap.to(o, { v: value, duration, ease: 'power3.out', onUpdate: write });
    return () => {
      live = false;
      tw.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, duration, prefix, suffix]);
  first.current ??= { __html: html(cur.current, null) };
  return <span ref={ref} className={`num ${className}`} dangerouslySetInnerHTML={first.current} />;
}

/** Source line, at the bottom of the slide. */
export function Src({ at = 0, children }: { at?: number; children: ReactNode }) {
  return (
    <R at={at} fx="fade" delay={600} className="src">
      {children}
    </R>
  );
}
