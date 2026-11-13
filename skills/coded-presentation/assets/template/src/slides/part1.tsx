import { GAP } from '../data/figures';
import { NB, Num, R, Words } from '../deck/ui';
import { Opener } from './opening';
import { sp, type SlideDef } from './types';

const RATIO = Math.round(GAP.large / GAP.small);

export const part1: SlideDef[] = [
  {
    id: 'p1',
    section: 1,
    label: '1 · The problem',
    steps: 1,
    stage: () => sp(0.22, 0.85),
    notes: 'One transition sentence to open the part.',
    render: () => <Opener n={1} />,
  },
  {
    id: 'idea',
    section: 1,
    label: 'One idea per slide',
    steps: 3,
    // The background temperature follows the argument: here it rises a notch at each step.
    stage: (s) => sp(0.25 + Math.max(0, s) * 0.2, 0.55),
    notes:
      'What to say before the first press. STEP 2: what to say after the second press. STEP 3: what to say after the third. The detail lives here, not on screen.',
    render: () => (
      <div className="pad idea">
        <Words as="h2" className="t-title" text="One idea per slide" />
        <R at={1} className="t-big idea-line c-2">
          Few words, set very large.
        </R>
        <R at={2} className="t-big idea-line">
          The detail goes <span className="c-hot">in the notes.</span>
        </R>
      </div>
    ),
  },
  {
    id: 'key-figure',
    section: 1,
    label: 'The number to remember',
    steps: 3,
    // The background points first form a tile ("tile"), then the whole wall ("wall").
    stage: (s) => sp(s >= 1 ? 0.92 : 0.2, s >= 1 ? 0.2 : 0.3, s >= 1 ? 'wall' : 'tile'),
    notes:
      'Set up the small number: the points on screen are that number. STEP 2: the big number arrives, each point is one unit. STEP 3: the ratio between the two, the only number the room needs to remember.',
    render: (s) => (
      <div className="gap">
        <div className="gap-left">
          <div className={`gap-n swap ${s >= 1 ? 'burn' : ''}`}>
            <Num className="g-ink" value={s >= 1 ? GAP.large : GAP.small} duration={2.6} />
            <Num className="g-hot gap-hot" value={s >= 1 ? GAP.large : GAP.small} duration={2.6} />
          </div>
          <div className="swap gap-cap">
            <R until={1} fx="fade" delay={500}>
              what you see first
            </R>
            <R at={1} fx="fade" delay={700}>
              what it really stands for
            </R>
          </div>
        </div>
        <div className="gap-right">
          <R at={2} fx="pop" className="gap-x g-hot">
            ×{RATIO}
          </R>
        </div>
        <R at={1} fx="fade" delay={1800} className="gap-legend">
          1 point = 1{NB}unit
        </R>
        <R at={1} fx="fade" delay={1200} className="src src-low">
          Source, scope and date of the measurement: always at the bottom of the slide.
        </R>
      </div>
    ),
  },
];
