import { useEffect, useState } from 'react';
import { useDeckKeys } from './deck/keys';
import { MODE, deck, useDeck } from './deck/store';
import { SlideShell } from './deck/ui';
import { Presenter } from './deck/Presenter';
import { slides } from './slides';
import { Stage } from './stage/Stage';

/** The canvas is always 1920×1080; it is scaled to fit the window. */
function useFit() {
  const calc = () => {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    return { k, w: 1920 * k, h: 1080 * k, x: (window.innerWidth - 1920 * k) / 2, y: (window.innerHeight - 1080 * k) / 2 };
  };
  const [fit, setFit] = useState(calc);
  useEffect(() => {
    const on = () => setFit(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return fit;
}

/** The deck's parts: every `section` value above zero, in order. */
const SECTIONS = [...new Set(slides.map((d) => d.section).filter((s) => s > 0))];

/** Thin bars at the bottom: one per part, filling up slide by slide. Hidden outside the parts. */
function Progress({ index }: { index: number }) {
  return (
    <div className={`progress ${slides[index].section === 0 ? 'quiet' : ''}`} aria-hidden="true">
      {SECTIONS.map((s) => {
        const mine = slides.map((d, i) => ({ d, i })).filter((x) => x.d.section === s);
        const ratio = mine.filter((x) => x.i <= index).length / mine.length;
        return (
          <span key={s} className="progress-seg">
            <span style={{ transform: `scaleX(${ratio})` }} />
          </span>
        );
      })}
    </div>
  );
}

function Overview({ index }: { index: number }) {
  return (
    <div className="overview" onClick={() => deck.toggleOverview(false)}>
      <ol>
        {slides.map((d, i) => (
          <li key={d.id}>
            <button
              className={i === index ? 'current' : ''}
              onClick={(e) => {
                e.stopPropagation();
                deck.goto(i);
              }}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {d.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Deck() {
  const st = useDeck();
  const fit = useFit();
  const def = slides[st.index];
  const [idle, setIdle] = useState(false);
  useDeckKeys();

  // The cursor hides after two seconds without movement.
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2000);
    const on = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2000);
    };
    window.addEventListener('mousemove', on);
    return () => {
      window.removeEventListener('mousemove', on);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`viewport ${idle ? 'idle' : ''}`}>
      {!MODE.nostage && (
        <div className="stage">
          <Stage spec={def.stage(st.step)} />
        </div>
      )}
      <div className="frame" style={{ transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.k})` }}>
        <SlideShell key={def.id} def={def} step={st.step} />
        <Progress index={st.index} />
      </div>
      {st.black && <div className="blackout" />}
      {st.overview && <Overview index={st.index} />}
    </div>
  );
}

export function App() {
  return MODE.presenter ? <Presenter /> : <Deck />;
}
