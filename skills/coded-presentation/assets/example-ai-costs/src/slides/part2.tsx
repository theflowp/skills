import { useEffect, useState } from 'react';
import { AGENT, API, EXAMPLE, PROD, type Turn } from '../data/pricing';
import { Num, R, Src, Words, fmt, useStep } from '../deck/ui';
import { Opener } from './intro';
import { sp, type SlideDef } from './types';

/** A counter that ticks on its own while the slide is on screen. */
function useTicker(everyMs: number, start = 1) {
  const [n, setN] = useState(start);
  useEffect(() => {
    const id = window.setInterval(() => setN((v) => v + 1), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return n;
}

const LOOP_NODES = [
  { label: 'Model', angle: -90 },
  { label: 'Tool', angle: 30 },
  { label: 'Result', angle: 150 },
];

function Loop() {
  const turn = useTicker(2600);
  return (
    <div className="loop">
      <svg viewBox="-360 -360 720 720" aria-hidden="true">
        <circle className="loop-track" r="250" />
        <g className="loop-orbit">
          <circle className="loop-dot" r="15" cy="-250" />
        </g>
      </svg>
      {LOOP_NODES.map((n, i) => {
        const a = (n.angle * Math.PI) / 180;
        return (
          <R key={n.label} fx="pop" delay={500 + i * 180} className="loop-node" style={{ left: 360 + Math.cos(a) * 250, top: 360 + Math.sin(a) * 250 }}>
            <span>{n.label}</span>
          </R>
        );
      })}
      <R fx="fade" delay={1100} className="loop-count">
        <span className="mono">{turn}</span>
        <span>{turn > 1 ? 'turns' : 'turn'}</span>
      </R>
    </div>
  );
}

const SCALE = 540 / AGENT.maxTokens;

function Bars({ list, on, cache, slow }: { list: Turn[]; on: boolean; cache: boolean; slow?: boolean }) {
  return (
    <div className={`bars ${on ? 'on' : ''} ${cache ? 'cache' : ''} ${list.length < 10 ? 'wide' : ''}`}>
      {list.map((t, i) => (
        <div className="bar" key={i} style={{ transitionDelay: on ? `${(slow ? 500 : 250) + i * (list.length < 10 ? 110 : 42)}ms` : '0ms' }}>
          <i className="fresh" style={{ height: t.fresh * SCALE }} />
          <i className="cached" style={{ height: t.cached * SCALE }} />
        </div>
      ))}
    </div>
  );
}

function Stairs() {
  const s = useStep();
  const total = s >= 2 ? AGENT.costParallel : s >= 1 ? AGENT.costCached : s >= 0 ? AGENT.costNaive : 0;
  return (
    <div className="stairs">
      <div className="stairs-text">
        <div className="swap stairs-title">
          <Words as="h2" className="t-title" until={1} text={'The bill climbs\nwith every turn'} />
          <Words as="h2" className="t-title" at={1} until={2} wordClass="g-cold" text="Caching" delay={250} />
          <Words as="h2" className="t-title" at={2} wordClass="g-cold" text="Parallel calls" delay={250} />
        </div>
        <div className="stairs-total">
          {/* A round $7: no decimals while the amount is a whole number. */}
          <Num value={total} decimals={s >= 1 ? 2 : 0} prefix="$" duration={1.8} />
          <span>/run</span>
        </div>
        <div className="swap stairs-cap">
          <R until={1} delay={900}>
            Every tool call resends the whole context.
          </R>
          <R at={1} until={2} delay={400}>
            What was already read costs {API.opus.in / API.opus.cacheRead}× less.
          </R>
          <R at={2} delay={400}>
            {EXAMPLE.parallel} tools per turn: {EXAMPLE.toolCalls / EXAMPLE.parallel} turns instead of {EXAMPLE.toolCalls}.
          </R>
        </div>
      </div>
      <div className="stairs-chart">
        <Bars list={AGENT.sequential} on={s >= 0 && s < 2} cache={s >= 1} />
        <Bars list={AGENT.grouped} on={s >= 2} cache slow />
        <div className="stairs-axis">
          <span className="mono">turn 1</span>
          <span className="mono swap">
            <R until={2} fx="fade">
              turn {EXAMPLE.toolCalls}
            </R>
            <R at={2} fx="fade">
              turn {EXAMPLE.toolCalls / EXAMPLE.parallel}
            </R>
          </span>
        </div>
        <R at={1} fx="fade" delay={500} className="stairs-legend">
          <span className="k-cold">re-read from cache</span>
          <span className="k-hot">new</span>
        </R>
      </div>
      <Src>
        Worked example: {EXAMPLE.toolCalls} tool calls, {fmt(EXAMPLE.baseTokens)}-token starting context, +{fmt(EXAMPLE.tokensPerCall)} per call. Claude Opus 5.5,
        public pricing.
      </Src>
    </div>
  );
}

function Prod() {
  const s = useStep();
  const value = s >= 3 ? PROD.perMonth : s >= 2 ? PROD.perDay : s >= 1 ? PROD.perRun : 0;
  return (
    <div className="pad prod">
      <Words as="h2" className="t-title" text="The same task, in production" />
      <div className="prod-body">
        <ul className="prod-list">
          <R as="li" delay={500}>
            Claude Code: <b>included.</b>
          </R>
          <R as="li" at={1}>
            Via the API: <b>${fmt(PROD.perRun)}</b> per run.
          </R>
          <R as="li" at={2}>
            {EXAMPLE.runsPerDay} runs a day.
          </R>
          <R as="li" at={3}>
            {EXAMPLE.daysPerMonth} days a month.
          </R>
        </ul>
        <div className="prod-figure swap">
          <R until={1} delay={700} className="prod-zero">
            <span className="g-cold">$0</span>
            <small>extra</small>
          </R>
          <R at={1} className="prod-n">
            <Num className="g-hot" value={value} prefix="$" duration={1.6} />
            <span className="swap">
              <R as="span" until={2} fx="fade">
                per run
              </R>
              <R as="span" at={2} until={3} fx="fade">
                per day
              </R>
              <R as="span" at={3} fx="fade">
                per month
              </R>
            </span>
          </R>
        </div>
      </div>
      <Src at={1}>Same example as the previous slide, without caching or parallel calls.</Src>
    </div>
  );
}

export const part2: SlideDef[] = [
  {
    id: 'p2',
    section: 2,
    label: '2 · Where does the money go?',
    steps: 1,
    stage: () => sp(0.95, 1),
    notes: 'Part two. We leave the developer’s desk: now we want an agent to run on its own, inside a company process. That is where the bill shows up.',
    render: () => <Opener n={2} />,
  },
  {
    id: 'agent-loop',
    section: 2,
    label: 'An agent is a loop',
    steps: 2,
    stage: (s) => sp(s >= 1 ? 0.9 : 0.5, 0.32, s >= 1 ? 'ringFat' : 'ring', { center: [1380, 548] }),
    notes:
      'What makes an agent powerful is tool calls. The model decides to call a tool (read a file, query the ERP), gets the result, thinks, and goes again. Claude Code and Codex work exactly like this, over dozens of turns. STEP 2: the catch. The model has no memory between two calls. On every turn, you send it the whole conversation from the start: the instructions, the tools, and every previous result. The context grows with every turn.',
    render: () => (
      <div className="agent-loop">
        <div className="agent-loop-text">
          <Words as="h2" className="t-title" text={'An agent\nis a loop'} />
          <R at={1} className="t-big agent-loop-line">
            On every turn,
            <br />
            <span className="c-hot">it rereads everything.</span>
          </R>
        </div>
        <Loop />
      </div>
    ),
  },
  {
    id: 'stairs',
    section: 2,
    label: 'The bill, caching, parallel calls',
    steps: 3,
    stage: (s) => sp(s >= 2 ? 0.02 : s >= 1 ? 0.14 : 1, s >= 1 ? 0.7 : 0.85, 'none'),
    notes:
      'Each bar is a turn: its height is what the model has to reread. An agent that makes 25 tool calls rereads an ever-larger context 25 times. Total for the example: $7 for a single run with Opus 5.5. It’s powerful, but it can turn into a money pit. STEP 2: first reflex, caching. What the model already read on the previous turn is billed 20 times cheaper. Same work, $1.10. Checking that caching is on is the first thing to do. STEP 3: second reflex, parallel calls. If the model fires 5 tools in the same turn instead of one, you go from 25 turns to 5: $0.74. Almost ten times less overall.',
    render: () => <Stairs />,
  },
  {
    id: 'prod',
    section: 2,
    label: 'From Claude Code to production',
    steps: 4,
    stage: (s) => sp([0.1, 0.5, 0.8, 1][Math.max(0, s)] ?? 0.1, 0.6),
    notes:
      'We start from a tool everyone knows. In Claude Code, this task costs nothing extra: it’s in the subscription. STEP 2: we want it to run autonomously, with nobody at the screen. That means going through the API: $7 per run. STEP 3: ten runs a day, $70. You quickly reach tens of dollars a day for a task that looked simple. STEP 4: over a month, $2,100. For a single task. That leads into the next part.',
    render: () => <Prod />,
  },
];
