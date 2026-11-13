import { R, Words } from '../deck/ui';
import { sp, type SlideDef } from './types';

export const closing: SlideDef[] = [
  {
    id: 'takeaways',
    section: 0,
    label: 'Takeaways',
    steps: 3,
    stage: (s) => sp(0.35 + Math.max(0, s) * 0.12, 0.6),
    notes: 'First idea to take home. STEP 2: the second. STEP 3: the third, the one you end on.',
    render: () => (
      <div className="pad takeaways">
        <R className="keep">
          <span className="mono">1</span>
          <p>
            First idea: <b>in a few words.</b>
          </p>
        </R>
        <R at={1} className="keep">
          <span className="mono">2</span>
          <p>
            Second idea: <b>just as short.</b>
          </p>
        </R>
        <R at={2} className="keep">
          <span className="mono">3</span>
          <p>
            The third, <b>the one that sticks.</b>
          </p>
        </R>
      </div>
    ),
  },
  {
    id: 'questions',
    section: 0,
    label: 'Questions',
    steps: 1,
    stage: () => sp(0.7, 1),
    notes: 'Q&A. Press O for the slide list, B to black out the screen.',
    render: () => (
      <div className="pad title-slide">
        <Words as="h2" className="t-hero title-h kin" wordClass="g-ink" text="Questions?" />
        <R className="sign" delay={900} fx="fade">
          Your Name · Your Company
        </R>
      </div>
    ),
  },
];
