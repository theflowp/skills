import { useEffect, useMemo, useState } from 'react';
import { slides } from '../slides';
import { useDeckKeys } from './keys';
import { useDeck } from './store';

const TARGET_MIN = 25;

/** Splits the notes: the text before the first "STEP n: ", then one block per step. */
function splitNotes(notes: string) {
  const parts = notes.split(/STEP (\d+): /);
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const blocks = [{ step: 0, text: parts[0].trim() }];
  for (let i = 1; i < parts.length; i += 2) blocks.push({ step: Number(parts[i]) - 1, text: cap(parts[i + 1].trim()) });
  return blocks;
}

const two = (n: number) => String(n).padStart(2, '0');

/**
 * Presenter view (P key from the deck): notes, timer, preview and next slide.
 * It drives the projected window, and follows it, over a BroadcastChannel.
 */
export function Presenter() {
  const st = useDeck();
  useDeckKeys();
  const def = slides[st.index];
  const next = slides[st.index + 1];
  const blocks = useMemo(() => splitNotes(def.notes), [def]);

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // The timer starts on the first slide change.
  useEffect(() => {
    if (st.index > 0) setRunning(true);
  }, [st.index]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
      setElapsed((e) => (running ? e + 1 : e));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') setRunning((r) => !r);
      if (e.key === 'r' || e.key === 'R') {
        setElapsed(0);
        setRunning(false);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const tone = minutes >= TARGET_MIN ? 'late' : minutes >= TARGET_MIN - 5 ? 'soon' : '';
  // The preview is loaded once; after that it follows navigation on its own.
  const preview = useMemo(() => `${location.pathname}?follow&nostage${location.hash}`, []);

  return (
    <div className="presenter">
      <header>
        <div className={`pr-timer ${tone}`}>
          {two(minutes)}:{two(elapsed % 60)}
          <small>{running ? `target ${TARGET_MIN} min` : 'T: start · R: reset'}</small>
        </div>
        <div className="pr-pos">
          {st.index + 1} / {slides.length}
          <small>
            {def.steps > 1 ? `step ${st.step + 1} of ${def.steps}` : 'single step'} · {two(now.getHours())}:{two(now.getMinutes())}
          </small>
        </div>
      </header>
      <main>
        <section className="pr-notes">
          <h1>{def.label}</h1>
          {blocks.map((b) => (
            <p key={b.step} className={b.step === st.step ? 'current' : b.step < st.step ? 'done' : ''}>
              {def.steps > 1 && <span>{b.step + 1}</span>}
              {b.text}
            </p>
          ))}
        </section>
        <aside>
          <div className="pr-preview">
            <iframe src={preview} title="Preview of the projected slide" tabIndex={-1} />
          </div>
          <div className="pr-next">
            <small>Next</small>
            {def.steps > 1 && st.step < def.steps - 1 ? `Step ${st.step + 2} of this slide` : next ? next.label : 'End'}
          </div>
        </aside>
      </main>
    </div>
  );
}
