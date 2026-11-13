import logoClaude from '../assets/logos/claude.svg';
import logoDeepseek from '../assets/logos/deepseek.svg';
import logoKimi from '../assets/logos/kimi.svg';
import logoMistral from '../assets/logos/mistral.svg';
import logoOpenai from '../assets/logos/openai.svg';
import logoQwen from '../assets/logos/qwen.svg';
import { API, CHECKED_ON, OPENROUTER, type LogoId } from '../data/pricing';
import { R, Src, Words, fmt, useStep } from '../deck/ui';
import { Opener } from './intro';
import { sp, type SlideDef } from './types';

const LADDER = [API.haiku, API.sonnet, API.opus, API.fable];
const LADDER_MAX = API.fable.in;
const RATIO = Math.round(API.fable.in / API.haiku.in);

function Ladder() {
  const s = useStep();
  return (
    <div className="ladder">
      {LADDER.map((m, i) => (
        <div className="ladder-col" key={m.name}>
          <R className="ladder-price mono" delay={700 + i * 220} fx="fade">
            ${fmt(m.in, m.in < 1 ? 2 : 0)}
          </R>
          <i
            className={`ladder-bar ${s >= 0 ? 'on' : ''}`}
            style={{ height: Math.max(4, (m.in / LADDER_MAX) * 400), transitionDelay: `${350 + i * 220}ms` }}
          />
          <R className="ladder-name" delay={250 + i * 220} fx="fade">
            <img className="model-logo" src={logoClaude} alt="" draggable={false} />
            {m.name}
          </R>
        </div>
      ))}
    </div>
  );
}

/** Three routes: the input, the router, then a model. The dots are tasks. */
const LANES = [
  { y: 90, name: 'Haiku', kind: 'cold', dots: [0, 0.55, 1.2, 1.75, 2.4] },
  { y: 220, name: 'Sonnet', kind: 'ink', dots: [0.3, 1.5, 2.6] },
  { y: 350, name: 'Opus', kind: 'hot', dots: [0.9] },
];

function Router() {
  const s = useStep();
  return (
    <div className={`router ${s >= 0 ? 'on' : ''}`}>
      <svg viewBox="0 0 1680 440" aria-hidden="true">
        <path className="route" pathLength={1} d="M0 220 H560" />
        {LANES.map((l) => (
          <path key={l.name} className="route" pathLength={1} d={`M560 220 C 760 220, 760 ${l.y}, 960 ${l.y} H1180`} />
        ))}
        <rect className="route-node" x="516" y="176" width="88" height="88" rx="22" transform="rotate(45 560 220)" />
        {LANES.map((l) =>
          l.dots.map((b, i) => (
            <circle key={`${l.name}${i}`} className={`task task-${l.kind}`} r="11">
              <animateMotion dur="3s" begin={`-${b}s`} repeatCount="indefinite" path={`M0 220 H560 C 760 220, 760 ${l.y}, 960 ${l.y} H1180`} />
            </circle>
          )),
        )}
      </svg>
      <R fx="fade" delay={500} className="router-in">
        tasks
      </R>
      <R fx="fade" delay={700} className="router-mid">
        router
      </R>
      {LANES.map((l, i) => (
        <R key={l.name} fx="left" delay={900 + i * 150} className={`router-out k-${l.kind}`} style={{ top: l.y }}>
          {l.name}
        </R>
      ))}
    </div>
  );
}

const OR_MAX = Math.max(...OPENROUTER.map((m) => m.out));

const LOGOS: Record<LogoId, string> = { claude: logoClaude, openai: logoOpenai, kimi: logoKimi, qwen: logoQwen, deepseek: logoDeepseek, mistral: logoMistral };

function Prices() {
  const s = useStep();
  return (
    <div className={`or-chart ${s >= 1 ? 'on' : ''}`}>
      {OPENROUTER.map((m, i) => (
        <div className={`or-row ${m.open ? 'open' : 'closed'}`} key={m.name} style={{ transitionDelay: `${i * 90}ms` }}>
          <span className="or-name">
            <img className="or-logo" src={LOGOS[m.logo]} alt="" draggable={false} />
            {m.name}
          </span>
          <span className="or-track">
            <i style={{ width: `calc((100% - 180px) * ${m.out / OR_MAX})`, transitionDelay: `${200 + i * 90}ms` }} />
            <b className="mono">${fmt(m.out, Number.isInteger(m.out) ? 0 : 2)}</b>
          </span>
        </div>
      ))}
    </div>
  );
}

const GRID = Array.from({ length: 100 }, (_, i) => i);
// Fixed positions of the dots that get passed on: the brief keeps only part of the context, the summary even less.
const BRIEF = new Set([3, 11, 17, 24, 28, 36, 42, 45, 53, 59, 66, 71, 78, 84, 92]);
const SUMMARY = new Set([17, 36, 45, 71, 84]);

function Dots({ keep, kind }: { keep?: Set<number>; kind: string }) {
  return (
    <div className={`dots dots-${kind}`}>
      {GRID.map((i) => (
        <i key={i} className={!keep || keep.has(i) ? 'lit' : ''} />
      ))}
    </div>
  );
}

export const part3: SlideDef[] = [
  {
    id: 'p3',
    section: 3,
    label: '3 · Cutting the bill',
    steps: 1,
    stage: () => sp(0.1, 0.95),
    notes: 'Part three: the levers. We just saw caching and parallel calls. Three are left: picking the model, open source, and architecture.',
    render: () => <Opener n={3} />,
  },
  {
    id: 'models',
    section: 3,
    label: 'A model for each task',
    steps: 2,
    stage: (s) => sp(s >= 1 ? 0.6 : 0.25, 0.5),
    notes:
      'First lever, the most obvious one: the model. At Anthropic, a million input tokens ranges from $0.10 for Haiku to $8 for Fable. Classifying an email or pulling a field out of an invoice doesn’t need the biggest model. STEP 2: a factor of 80 between the two extremes. But careful: you still need a model with a minimum of IQ, otherwise the agent gets it wrong, starts over, and you end up paying more.',
    render: () => (
      <div className="pad models">
        <Words as="h2" className="t-title" text="A model for each task" />
        <Ladder />
        <R at={1} fx="pop" className="ladder-x">
          <span className="g-hot">×{RATIO}</span>
          <small>from smallest to largest</small>
        </R>
        <Src>Input price per million tokens. Anthropic public pricing, {CHECKED_ON}.</Src>
      </div>
    ),
  },
  {
    id: 'routing',
    section: 3,
    label: 'Routing tasks',
    steps: 4,
    stage: () => sp(0.3, 0.45),
    notes:
      'The next step is routing: a dispatcher sends each task to the smallest model able to handle it. STEP 2: a model that is too weak fails the task. You need a minimum of IQ. STEP 3: routing quickly gets complex. As you keep adding rules, you overfit: it works on your test examples, not on real cases anymore. STEP 4: in our experience, keeping a single model and tuning it well (instructions, reasoning effort, caching) is often more effective than maintaining a router.',
    render: () => (
      <div className="pad routing">
        <Words as="h2" className="t-title" text="Routing tasks" />
        <Router />
        <ul className="cautions">
          <R as="li" at={1}>
            You still need a minimum of IQ.
          </R>
          <R as="li" at={2}>
            Too many rules: watch out for overfitting.
          </R>
          <R as="li" at={3} className="c-ink">
            Often, one well-tuned model is enough.
          </R>
        </ul>
      </div>
    ),
  },
  {
    id: 'openrouter',
    section: 3,
    label: 'OpenRouter',
    steps: 2,
    stage: () => sp(0.4, 0.45),
    notes:
      'To compare models, a great tool: OpenRouter. One API, one key, and behind it every model, proprietary and open source, hosted by cloud providers. You switch models by changing one line. Ideal for testing fast. STEP 2: today’s output prices. Open-weight models cost much less per token. The real question is whether they live up to their promises: next slide.',
    render: () => (
      <div className="pad openrouter">
        <div className="or-head">
          <Words as="h2" className="t-hero" wordClass="g-ink" text="OpenRouter" />
          <R className="t-body" delay={500}>
            Every model, one API.
          </R>
        </div>
        <Prices />
        <R at={1} fx="fade" delay={600} className="or-legend">
          <span className="k-hot">proprietary</span>
          <span className="k-cold">open-weight</span>
        </R>
        <Src at={1}>Output price per million tokens. OpenRouter, {CHECKED_ON}.</Src>
      </div>
    ),
  },
  {
    id: 'benchmaxxed',
    section: 3,
    label: 'Benchmaxxed',
    steps: 3,
    stage: (s) => sp(s >= 1 ? 0.8 : 0.35, 0.5),
    notes:
      'Be wary of benchmarks. “Benchmaxxed”: a model trained to score well on public tests. STEP 2: in the field, results fall short of the advertised score. Anthropic and OpenAI mostly play fair: their models hold their scores in real use. Many open-source models are overtrained on benchmarks and disappoint in practice, DeepSeek included. STEP 3: the only measure that counts is your own cases. Twenty real examples are enough to compare two models.',
    render: (s) => (
      <div className="pad bench">
        <div className="bench-text">
          <Words as="h2" className="t-hero" wordClass="g-ink" text="Benchmaxxed" />
          <R className="t-body" delay={550}>
            Trained for the test, not for the job.
          </R>
          <R at={2} className="t-big bench-do">
            Test on <span className="c-hot">your own cases.</span>
          </R>
        </div>
        <div className={`bench-bars ${s >= 0 ? 'on' : ''} ${s >= 1 ? 'drop' : ''}`}>
          <div className="bench-col">
            <i className="bench-a" />
            <span>on the test</span>
          </div>
          <div className="bench-col">
            <i className="bench-b" />
            <span>on your tasks</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'subagents',
    section: 3,
    label: 'Subagents',
    steps: 4,
    stage: (s) => sp(s >= 1 ? 0.65 : 0.35, 0.45),
    notes:
      'Last lever, and a counter-intuitive one. Splitting the work across several subagents sounds like a good idea: each with its specialty and its small context. The main agent has the full context: each dot is a piece of information. STEP 2: when it delegates, it only passes on a brief, so a small part of what it knows. And the subagent only sends back a summary. Every hand-off loses information: a game of telephone. STEP 3: Anthropic wrote it on October 22, 2026, in “When to fold subagents into your main agent loop”: a single agent that has seen every step often does better, and one of their customers measured a run about twice as fast. STEP 4: subagents are still useful for truly parallel work, broad research and independent verification. Not for work that depends on context.',
    render: () => (
      <div className="pad subagents">
        <Words as="h2" className="t-title" text="Subagents: good on paper" accent={['good', 'on', 'paper']} />
        <div className="relay">
          <R className="relay-col" delay={600}>
            <Dots kind="full" />
            <span>main agent</span>
          </R>
          <R at={1} fx="fade" className="relay-arrow">
            <span>brief</span>
          </R>
          <R at={1} className="relay-col" delay={250}>
            <Dots kind="brief" keep={BRIEF} />
            <span>subagent</span>
          </R>
          <R at={1} fx="fade" className="relay-arrow" delay={650}>
            <span>summary</span>
          </R>
          <R at={1} className="relay-col" delay={900}>
            <Dots kind="summary" keep={SUMMARY} />
            <span>what comes back</span>
          </R>
        </div>
        <div className="swap subagents-foot">
          <R at={2} until={3} className="quote">
            <p className="t-big">“Each call returns a lossy summary.”</p>
            <span>Anthropic, October 22, 2026</span>
          </R>
          <R at={3} className="t-big subagents-keep">
            Useful for parallel work, research, verification.
          </R>
        </div>
      </div>
    ),
  },
];
