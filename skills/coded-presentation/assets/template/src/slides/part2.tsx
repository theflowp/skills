import { BARS, CHECKED_ON } from '../data/figures';
import { R, Src, Words, fmt, useStep } from '../deck/ui';
import { Opener } from './opening';
import { sp, type SlideDef } from './types';

const MAX = Math.max(...BARS.map((b) => b.value));
const RATIO = Math.round(MAX / Math.min(...BARS.map((b) => b.value)));

/** A chart that reads from the back of the room: few bars, the value written above, the name below. */
function Bars() {
  const s = useStep();
  return (
    <div className="ladder">
      {BARS.map((b, i) => (
        <div className="ladder-col" key={b.name}>
          <R className="ladder-price mono" delay={700 + i * 220} fx="fade">
            {fmt(b.value)}
          </R>
          <i className={`ladder-bar ${s >= 0 ? 'on' : ''}`} style={{ height: Math.max(4, (b.value / MAX) * 400), transitionDelay: `${350 + i * 220}ms` }} />
          <R className="ladder-name" delay={250 + i * 220} fx="fade">
            {b.name}
          </R>
        </div>
      ))}
    </div>
  );
}

const ROWS = [
  { criterion: 'Cost', before: 'High', after: 'Low' },
  { criterion: 'Lead time', before: 'Long', after: 'Short' },
  { criterion: 'Risk', before: 'High', after: 'Contained' },
];

export const part2: SlideDef[] = [
  {
    id: 'p2',
    section: 2,
    label: '2 · The solution',
    steps: 1,
    stage: () => sp(0.1, 0.95),
    notes: 'One transition sentence to open the part.',
    render: () => <Opener n={2} />,
  },
  {
    id: 'bars',
    section: 2,
    label: 'One chart, one idea',
    steps: 2,
    stage: (s) => sp(s >= 1 ? 0.6 : 0.25, 0.5),
    notes: 'Say what the bars show. STEP 2: the ratio between the smallest and the largest.',
    render: () => (
      <div className="pad models">
        <Words as="h2" className="t-title" text="One chart, one idea" />
        <Bars />
        <R at={1} fx="pop" className="ladder-x">
          <span className="g-hot">×{RATIO}</span>
          <small>from smallest to largest</small>
        </R>
        <Src>What the bars measure, the source and the date: {CHECKED_ON}.</Src>
      </div>
    ),
  },
  {
    id: 'comparison',
    section: 2,
    label: 'Before, after',
    steps: 3,
    stage: (s) => sp(0.3, 0.4 + Math.max(0, s) * 0.05),
    notes: 'First criterion. STEP 2: second criterion. STEP 3: third criterion. Give the orders of magnitude out loud.',
    render: () => (
      <div className="pad compare">
        <R className="cmp-head" fx="fade" delay={300}>
          <span />
          <span>Before</span>
          <span>After</span>
        </R>
        {ROWS.map((row, i) => (
          <R key={row.criterion} at={i} className="cmp-row" delay={i === 0 ? 450 : 0}>
            <span className="cmp-label">{row.criterion}</span>
            <span className="cmp-a g-hot">{row.before}</span>
            <span className="cmp-b g-cold">{row.after}</span>
          </R>
        ))}
      </div>
    ),
  },
];
