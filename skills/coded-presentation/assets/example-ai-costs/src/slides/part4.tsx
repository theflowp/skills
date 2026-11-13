import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { R, Words, useStep } from '../deck/ui';
import { Opener } from './intro';
import { sp, type SlideDef } from './types';

type Kind = 'det' | 'ai' | 'human';
type Node = { id: string; label: string[]; x: number; y: number; kind: Kind };

/** The workflow of the real case: 8 steps, only one calls a model. */
const X = [218, 465, 712, 959, 1206, 1453, 1700];
const NODES: Node[] = [
  { id: 'erp', label: ['ERP'], x: X[0], y: 150, kind: 'det' },
  { id: 'crm', label: ['CRM'], x: X[0], y: 330, kind: 'det' },
  { id: 'calc', label: ['Calculate'], x: X[1], y: 240, kind: 'det' },
  { id: 'rules', label: ['Decision', 'rules'], x: X[2], y: 240, kind: 'det' },
  { id: 'agent', label: ['AI agent'], x: X[3], y: 240, kind: 'ai' },
  { id: 'human', label: ['Human', 'approval'], x: X[4], y: 240, kind: 'human' },
  { id: 'order', label: ['Purchase', 'order'], x: X[5], y: 240, kind: 'det' },
  { id: 'mail', label: ['Supplier', 'email'], x: X[6], y: 240, kind: 'det' },
];
const W = 196;
const H = 124;
const EDGES = [
  `M${X[0] + W / 2} 150 C 356 150, 336 240, ${X[1] - W / 2} 240`,
  `M${X[0] + W / 2} 330 C 356 330, 336 240, ${X[1] - W / 2} 240`,
  ...X.slice(1, -1).map((x, i) => `M${x + W / 2} 240 H${X[i + 2] - W / 2}`),
];
// The glowing dot follows the links' path exactly: it leaves the ERP block (and the CRM block),
// takes the curve, then runs in a straight line to the email.
const runFrom = (y: number, lead = 0) => `M${X[0] - lead} ${y} H${X[0] + W / 2} C 356 ${y}, 336 240, ${X[1] - W / 2} 240 H${X[6]}`;
const RUNS = [runFrom(150), runFrom(330)];
const RUN_SECONDS = 5.2;
const AI_STEPS = NODES.filter((n) => n.kind === 'ai').length;

/*
 * "AI designs the workflow": an ember travels the same path, and each block, each link appears
 * at the instant it passes. The distances below are used to time those instants.
 */
const DRAW_SECONDS = 4;
const LEAD = 150;
const DRAW = runFrom(150, LEAD);
const CURVE = (() => {
  // Length of the ERP → Calculate curve, measured in small segments.
  const [p0, p1, p2, p3] = [
    [X[0] + W / 2, 150],
    [356, 150],
    [336, 240],
    [X[1] - W / 2, 240],
  ];
  const at = (t: number, k: number) => (1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * p1[k] + 3 * (1 - t) * t * t * p2[k] + t ** 3 * p3[k];
  let len = 0;
  for (let i = 1; i <= 60; i++) len += Math.hypot(at(i / 60, 0) - at((i - 1) / 60, 0), at(i / 60, 1) - at((i - 1) / 60, 1));
  return len;
})();
/** Distance traveled by the ember when it reaches the center of a column. */
const reach = (col: number) => (col === 0 ? LEAD : LEAD + W + CURVE + (X[col] - X[1]));
const msAt = (distance: number) => (distance / reach(X.length - 1)) * DRAW_SECONDS * 1000;
/*
 * Running workflow: each block lights up while the ball crosses it. The ball moves at constant
 * speed, so the instant it enters a block follows from the distance traveled.
 */
const RUN_LENGTH = W / 2 + CURVE + (X[X.length - 1] - (X[1] - W / 2));
const enterAt = (col: number) => (col === 0 ? 0 : ((W / 2 + CURVE + (X[col] - X[1])) / RUN_LENGTH) * RUN_SECONDS);
/** Start and length of each link along the path, in EDGES order. */
const EDGE_SPANS = EDGES.map((_, i) => (i < 2 ? { from: LEAD + W / 2, len: CURVE } : { from: reach(i - 1) + W / 2, len: X[i] - X[i - 1] - W }));

function Pipeline({ build }: { build?: boolean }) {
  const s = useStep();
  const shown = s >= 0;
  const running = build ? s >= 1 : shown;

  // The ember drawing plays only once: when arriving on the slide at its first step.
  const entry = useRef<number | null>(null);
  const left = useRef(false);
  if (s >= 0 && entry.current === null) entry.current = s;
  if (s >= 1) left.current = true;
  const drawing = !!build && entry.current === 0 && s === 0 && !left.current;

  // The balls leave the ERP and CRM blocks the moment the workflow starts running: that is what
  // keeps them in sync with the blocks' flash, which is also started at that instant.
  const pulses = useRef<(SVGAnimateMotionElement | null)[]>([]);
  useEffect(() => {
    if (!running) return;
    const id = requestAnimationFrame(() => pulses.current.forEach((p) => p?.beginElement()));
    return () => cancelAnimationFrame(id);
  }, [running]);

  // The ember starts one frame after display: started earlier, before the SVG has started its
  // clock, it stays put and then jumps to the end.
  const spark = useRef<SVGAnimateMotionElement>(null);
  useEffect(() => {
    if (!drawing) return;
    const id = requestAnimationFrame(() => spark.current?.beginElement());
    return () => cancelAnimationFrame(id);
  }, [drawing]);

  return (
    <div
      className={`pipe ${shown ? 'on' : ''} ${drawing ? 'drawing' : ''} ${running ? 'running' : ''}`}
      style={{ '--draw': `${DRAW_SECONDS + 0.3}s` } as CSSProperties}
    >
      <svg viewBox="0 0 1920 480" aria-hidden="true">
        {EDGES.map((d, i) => (
          <path
            key={i}
            className="pipe-edge"
            pathLength={1}
            d={d}
            style={
              drawing
                ? { transitionDelay: `${msAt(EDGE_SPANS[i].from)}ms`, transitionDuration: `${Math.max(140, msAt(EDGE_SPANS[i].len))}ms`, transitionTimingFunction: 'linear' }
                : { transitionDelay: `${300 + Math.max(0, i - 1) * 110}ms` }
            }
          />
        ))}
        {running &&
          RUNS.map((path, i) => (
            <circle key={path} className="pipe-pulse" r="12">
              <animateMotion
                ref={(el) => {
                  pulses.current[i] = el as SVGAnimateMotionElement | null;
                }}
                dur={`${RUN_SECONDS}s`}
                begin="indefinite"
                repeatCount="indefinite"
                path={path}
              />
            </circle>
          ))}
      </svg>
      {NODES.map((n, i) => {
        const col = Math.max(0, i - 1);
        const arrival = msAt(reach(col));
        return (
          <div
            key={n.id}
            // At both ends of the path, the ball only crosses half of the block.
            className={`pipe-node k-${n.kind} ${col === 0 || col === X.length - 1 ? 'half' : ''}`}
            style={{
              left: n.x - W / 2,
              top: n.y - H / 2,
              width: W,
              height: H,
              transitionDelay: `${drawing ? Math.max(0, arrival - 160) : 150 + col * 110}ms`,
              animationDelay: drawing ? `${arrival}ms` : `${enterAt(col).toFixed(3)}s`,
            }}
          >
            {n.label.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        );
      })}
      {drawing && (
        // Drawn on top of the blocks: you see it pass over each one, then it fades out at the last.
        <svg viewBox="0 0 1920 480" aria-hidden="true">
          <circle className="pipe-spark" r="15">
            <animateMotion ref={spark} dur={`${DRAW_SECONDS}s`} begin="indefinite" fill="freeze" path={DRAW} />
          </circle>
        </svg>
      )}
    </div>
  );
}

const TOOLS = [
  { label: 'ERP', x: -310, y: -210 },
  { label: 'CRM', x: 310, y: -210 },
  { label: 'Emails', x: 310, y: 210 },
  { label: 'Sheets', x: -310, y: 210 },
];

function AgentOnly() {
  const [turn, setTurn] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setTurn((v) => v + 1), 420);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="solo">
      <svg viewBox="-480 -360 960 720" aria-hidden="true">
        {TOOLS.map((t, i) => (
          <g key={t.label}>
            <path className="solo-spoke" d={`M0 0 L${t.x} ${t.y}`} />
            <circle className="solo-pulse" r="10">
              <animateMotion dur={`${0.9 + i * 0.23}s`} begin={`-${i * 0.31}s`} repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" path={`M0 0 L${t.x} ${t.y}`} />
            </circle>
          </g>
        ))}
        <circle className="solo-halo" r="170" />
        <circle className="solo-core" r="128" />
      </svg>
      <R fx="pop" delay={500} className="solo-name">
        Agent
      </R>
      {TOOLS.map((t, i) => (
        <R key={t.label} fx="pop" delay={700 + i * 120} className="solo-tool" style={{ left: 480 + t.x, top: 360 + t.y }}>
          <span>{t.label}</span>
        </R>
      ))}
      <R fx="fade" delay={1300} className="solo-turn mono">
        turn {turn}
      </R>
    </div>
  );
}

/**
 * Club badge, redrawn from the supplied image (same proportions, same colors) to get clean edges
 * on a black background, real depth and a moving highlight.
 */
const DEPTH = Array.from({ length: 12 }, (_, i) => i);

function ClubBadge() {
  return (
    <R fx="pop" delay={250} className="badge">
      <div className="badge-glow" />
      <div className="badge-body" role="img" aria-label="AI Meetup PRO">
        {DEPTH.map((i) => (
          <i key={i} className="badge-depth" style={{ transform: `translateZ(${-(i + 1) * 2.2}px)`, filter: `brightness(${1 - i * 0.028})` }} />
        ))}
        <div className="badge-face">
          <span className="badge-sun" />
          <span className="badge-bar badge-bar-1" />
          <span className="badge-bar badge-bar-2" />
          <span className="badge-name">
            <b>AI</b> Meetup
          </span>
          <span className="badge-tag">PRO</span>
          <i className="badge-shine" />
        </div>
      </div>
    </R>
  );
}

const ROWS = [
  { label: 'Cost', a: 'High', b: 'Low' },
  { label: 'Stability', a: 'Variable', b: 'Stable' },
  { label: 'Output', a: 'Unverified', b: 'Reliable' },
];

export const part4: SlideDef[] = [
  {
    id: 'p4',
    section: 4,
    label: '4 · A real case',
    steps: 1,
    stage: () => sp(0.16, 0.9),
    notes: 'Last part: a real case from a client project. The client and the details stay confidential; the architecture is the real one.',
    render: () => <Opener n={4} />,
  },
  {
    id: 'scenario',
    section: 4,
    label: 'A wholesaler’s routine',
    steps: 3,
    stage: (s) => sp(0.1 + Math.max(0, s) * 0.12, 0.85),
    notes:
      'Set the scene: a routine at a wholesaler, restocking. STEP 2: thousands of SKUs in stock, suppliers each with their own lead times and minimum order quantities. STEP 3: the question the buyers ask themselves every week. Today, several people spend hours on it in spreadsheets. That is the process we automated.',
    render: () => (
      <div className="pad scenario">
        <h2 className="t-hero">
          <Words className="kin" wordClass="g-ink" text="A wholesaler’s" stagger={140} />
          <Words className="kin" wordClass="g-ink" text="routine" delay={260} stagger={140} />
        </h2>
        <R at={1} className="t-big c-2">
          Thousands of SKUs in stock.
        </R>
        <R at={2} className="t-big">
          What to order? How much? <span className="c-hot">From whom?</span>
        </R>
      </div>
    ),
  },
  {
    id: 'agentic',
    section: 4,
    label: 'Version 1: fully agentic',
    steps: 1,
    stage: () => sp(1, 0.9),
    notes:
      'First architecture, the most tempting one: give every tool to a big model and let it get on with it. It queries the ERP and the CRM, reads the emails, opens the spreadsheets, and decides everything. Look at the turn counter: dozens of round trips for each run, with the whole context resent every time. It works in a demo. In production it is expensive, and two runs on the same data don’t produce the same order.',
    render: () => (
      <div className="agentic">
        <div className="agentic-text">
          <Words as="h2" className="t-title" text="First version: fully agentic" />
          <R className="t-body" delay={700}>
            A big model decides everything,
            <br />
            on every run.
          </R>
        </div>
        <AgentOnly />
      </div>
    ),
  },
  {
    id: 'workflow',
    section: 4,
    label: 'Version 2: a workflow',
    steps: 2,
    stage: () => sp(0.03, 0.75),
    notes:
      'Second architecture: a workflow, building blocks wired together. Connectors read the ERP and the CRM. The need per SKU is a calculation, so it is code. Order or wait: decision rules. The AI agent only steps in where judgment is needed: ambiguous cases, grouping orders, writing. A buyer approves. The purchase order goes into the ERP through its API, then the email goes to the supplier. STEP 2: only one step out of eight calls a model. The other seven are deterministic: free or nearly free, and identical on every run.',
    render: () => (
      <div className="pad workflow">
        <Words as="h2" className="t-title" text="Second version: a workflow" />
        <Pipeline />
        <R at={1} className="t-big pipe-count">
          <span className="c-hot">{AI_STEPS} step out of {NODES.length}</span> calls a model.
        </R>
        <R fx="fade" delay={1500} className="pipe-legend">
          <span className="k-cold">deterministic</span>
          <span className="k-hot">AI</span>
          <span className="k-ink">human</span>
        </R>
      </div>
    ),
  },
  {
    id: 'comparison',
    section: 4,
    label: 'Cost, stability, output',
    steps: 3,
    stage: (s) => sp(0.3, 0.4 + Math.max(0, s) * 0.05),
    notes:
      'The comparison, on three criteria. Cost: the fully agentic version pays for dozens of big-model turns on every run; the workflow, for one small call. STEP 2: stability. An agent never does exactly the same thing twice. A calculation does. STEP 3: the output. An order quantity computed by code is exact. Computed by a model, it has to be checked again. Give the project’s orders of magnitude out loud here.',
    render: () => (
      <div className="pad compare">
        <R className="cmp-head" fx="fade" delay={300}>
          <span />
          <span>Fully agentic</span>
          <span>Workflow</span>
        </R>
        {ROWS.map((row, i) => (
          <R key={row.label} at={i} className="cmp-row" delay={i === 0 ? 450 : 0}>
            <span className="cmp-label">{row.label}</span>
            <span className="cmp-a g-hot">{row.a}</span>
            <span className="cmp-b g-cold">{row.b}</span>
          </R>
        ))}
      </div>
    ),
  },
  {
    id: 'ai-design',
    section: 4,
    label: 'AI designs the workflow',
    steps: 2,
    stage: (s) => sp(s >= 1 ? 0.05 : 0.7, 0.7),
    notes:
      'The most important point. We didn’t draw this workflow by hand: AI designed it with us, while we talked through the process. It writes the calculations, the rules, the connectors. STEP 2: once designed, it runs without AI, except at the one step that truly needs judgment. AI is there to build the process, not necessarily to run it. That is where you win on cost, stability and output.',
    render: () => (
      <div className="pad workflow">
        <Words as="h2" className="t-title" text="AI designs the workflow" />
        <Pipeline build />
        <R at={1} className="t-big pipe-count">
          It doesn’t need to be <span className="c-cold">in every step.</span>
        </R>
      </div>
    ),
  },
];

export const outro: SlideDef[] = [
  {
    id: 'takeaways',
    section: 0,
    label: 'Takeaways',
    steps: 3,
    stage: (s) => sp(0.35 + Math.max(0, s) * 0.12, 0.6),
    notes:
      'Three ideas to take home. For coding: the subscription, no hesitation. STEP 2: in production you pay per token: caching, parallel calls, and the right model for the task. STEP 3: and above all, deterministic code wherever possible. AI where judgment is needed.',
    render: () => (
      <div className="pad takeaways">
        <R className="keep">
          <span className="mono">1</span>
          <p>
            For coding: <b>the subscription.</b>
          </p>
        </R>
        <R at={1} className="keep">
          <span className="mono">2</span>
          <p>
            In production: <b>caching, parallelism, right model.</b>
          </p>
        </R>
        <R at={2} className="keep">
          <span className="mono">3</span>
          <p>
            Deterministic code <b>wherever you can.</b>
          </p>
        </R>
      </div>
    ),
  },
  {
    id: 'club',
    section: 0,
    label: 'The club',
    steps: 1,
    stage: () => sp(0.62, 0.9),
    notes:
      'One announcement before the questions: I’m launching an AI club for professionals. Say in two sentences who it is for, how often it meets, and how to sign up.',
    render: () => (
      <div className="club">
        <ClubBadge />
      </div>
    ),
  },
  {
    id: 'questions',
    section: 0,
    label: 'Questions',
    steps: 1,
    stage: () => sp(0.7, 1),
    notes: 'Q&A. Press O to show the slide list and go back to any slide. Press B to black out the screen.',
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

