import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { slides } from '../slides';

export type DeckState = {
  index: number;
  step: number;
  dir: 1 | -1;
  black: boolean;
  overview: boolean;
};

const params = new URLSearchParams(location.search);

/** presenter: speaker view. follow: remotely driven preview. nostage: no WebGL. */
export const MODE = {
  presenter: params.has('presenter'),
  follow: params.has('follow'),
  nostage: params.has('nostage'),
};

function clamp(index: number, step: number) {
  const i = Math.max(0, Math.min(slides.length - 1, Math.round(index) || 0));
  const s = Math.max(0, Math.min(slides[i].steps - 1, Math.round(step) || 0));
  return { index: i, step: s };
}

function fromHash() {
  const m = location.hash.match(/^#\/(\d+)(?:\/(\d+))?/);
  return m ? clamp(Number(m[1]) - 1, Number(m[2] ?? 0)) : { index: 0, step: 0 };
}

let state: DeckState = { ...fromHash(), dir: 1, black: false, overview: false };
const listeners = new Set<() => void>();
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`deck:${location.pathname}`) : null;

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => ViewTransition };

function set(next: DeckState, remote = false) {
  const slideChanged = next.index !== state.index;
  const apply = () => {
    state = next;
    listeners.forEach((l) => l());
  };
  const doc = document as ViewTransitionDoc;
  if (slideChanged && !MODE.presenter && !state.overview && doc.startViewTransition) {
    document.documentElement.dataset.dir = next.dir > 0 ? 'fwd' : 'back';
    const vt = doc.startViewTransition(() => flushSync(apply));
    // A quick key press interrupts the running transition: that is not an error.
    vt.ready.catch(() => {});
    vt.finished.catch(() => {});
  } else {
    apply();
  }
  history.replaceState(null, '', `#/${next.index + 1}/${next.step}`);
  if (!remote) channel?.postMessage({ index: next.index, step: next.step, black: next.black });
}

channel?.addEventListener('message', (e: MessageEvent) => {
  const d = e.data;
  if (!d) return;
  if (d.type === 'hello') {
    channel.postMessage({ index: state.index, step: state.step, black: state.black });
    return;
  }
  const c = clamp(d.index, d.step);
  if (c.index === state.index && c.step === state.step && !!d.black === state.black) return;
  const dir = c.index > state.index || (c.index === state.index && c.step >= state.step) ? 1 : -1;
  set({ ...state, ...c, dir, black: !!d.black, overview: false }, true);
});

window.addEventListener('hashchange', () => {
  const c = fromHash();
  if (c.index !== state.index || c.step !== state.step) set({ ...state, ...c, dir: 1 });
});

// A window that opens (speaker view, preview) asks the others for the current state.
if (MODE.presenter || MODE.follow) channel?.postMessage({ type: 'hello' });

export const deck = {
  next() {
    const { index, step } = state;
    if (step < slides[index].steps - 1) set({ ...state, step: step + 1, dir: 1 });
    else if (index < slides.length - 1) set({ ...state, index: index + 1, step: 0, dir: 1 });
  },
  prev() {
    const { index, step } = state;
    if (step > 0) set({ ...state, step: step - 1, dir: -1 });
    else if (index > 0) set({ ...state, index: index - 1, step: slides[index - 1].steps - 1, dir: -1 });
  },
  goto(index: number, step = 0) {
    const c = clamp(index, step);
    set({ ...state, ...c, dir: c.index >= state.index ? 1 : -1, overview: false });
  },
  toggleBlack() {
    set({ ...state, black: !state.black });
  },
  toggleOverview(force?: boolean) {
    set({ ...state, overview: force ?? !state.overview });
  },
};

// Hook for tools (tools/browser.mjs): list the slides and move between them from outside.
(window as unknown as { __deck: unknown }).__deck = {
  slides: slides.map((d) => ({ id: d.id, label: d.label, steps: d.steps, section: d.section })),
  state: () => ({ index: state.index, step: state.step }),
  goto: deck.goto,
  next: deck.next,
  prev: deck.prev,
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDeck() {
  return useSyncExternalStore(subscribe, () => state);
}
