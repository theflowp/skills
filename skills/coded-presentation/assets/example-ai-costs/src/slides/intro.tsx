import { R, Words } from '../deck/ui';
import { sp, type SlideDef } from './types';

export const PARTS = ['Subscription\nor API?', 'Where does\nthe money go?', 'Cutting the bill', 'A real case'];

/** Part-opener slide: a giant outlined number and a title. */
export function Opener({ n }: { n: number }) {
  return (
    <div className="opener">
      {/* Outline taken from the digit's filled shape: the font's contours overlap (the bar of the 4), a plain stroke would show them. */}
      <svg className="opener-defs" aria-hidden="true">
        <filter id="contour-hot">
          <feMorphology in="SourceAlpha" operator="erode" radius="2.5" result="inner" />
          <feComposite in="SourceGraphic" in2="inner" operator="out" />
        </filter>
      </svg>
      <R fx="fade" className="opener-n">
        <span>{n}</span>
      </R>
      <Words as="h2" className="t-hero opener-t kin" wordClass="g-ink" text={PARTS[n - 1]} delay={180} stagger={110} />
    </div>
  );
}

export const intro: SlideDef[] = [
  {
    id: 'title',
    section: 0,
    label: 'Title',
    steps: 1,
    stage: () => sp(0.78, 1),
    notes:
      'Introduce yourself in one sentence: who you are, your company, what you do. State the deal: 25 minutes about money. What we pay to code with AI, what it costs once it runs in production, and how to bring the bill down.',
    render: () => (
      <div className="pad title-slide">
        <Words as="h1" className="t-hero title-h kin" wordClass="g-ink" text="AI in production" stagger={120} />
        <Words as="p" className="title-sub" wordClass="g-hot" text="What it really costs" delay={560} stagger={90} />
        <R className="sign" delay={1400} fx="fade">
          Your Name · Your Company
        </R>
      </div>
    ),
  },
  {
    id: 'outline',
    section: 0,
    label: 'Outline',
    steps: 1,
    stage: () => sp(0.5, 0.55),
    notes:
      'Four parts. First us, the developers: subscription or API. Then production: why an agent gets expensive. Then the levers to pay less. And a real case from a client project. Questions at the end.',
    render: () => (
      <div className="pad outline">
        {PARTS.map((t, i) => (
          <R key={i} className="outline-row" delay={120 + i * 170}>
            <span className="mono outline-n">{i + 1}</span>
            <span>{t}</span>
          </R>
        ))}
      </div>
    ),
  },
];
