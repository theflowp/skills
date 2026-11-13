import { API, PLANS, ULTRA } from '../data/pricing';
import { NB, Num, R, Src, Words, fmt } from '../deck/ui';
import iconClaude from '../assets/icon-claude.png';
import iconCodex from '../assets/icon-codex.png';
import { Opener } from './intro';
import { sp, type SlideDef } from './types';

/** A sentence cut into tokens the way a model sees it: some words split into pieces. */
const CHIPS = ['What', 'stock', 'to', 're', 'order', 'this', 'week', '?'];

function Plans({ list }: { list: { name: string; usd: number }[] }) {
  return (
    <R at={2} className="plans">
      {list.map((p, i) => (
        <div className="plan-chip" key={i}>
          <span className="mono">${p.usd}</span>
          <span>{p.name}</span>
        </div>
      ))}
    </R>
  );
}

/** App icon: the real macOS icons of both tools (Claude.app and Codex), with a slow 3D sway. */
const ICONS = { claude: iconClaude, codex: iconCodex };

function AppIcon({ kind, at = 0, delay }: { kind: 'claude' | 'codex'; at?: number; delay: number }) {
  return (
    <R className={`app-icon app-icon-${kind}`} fx="pop" at={at} delay={delay}>
      <span className="app-icon-3d">
        <img src={ICONS[kind]} alt="" draggable={false} />
      </span>
    </R>
  );
}

export const part1: SlideDef[] = [
  {
    id: 'p1',
    section: 1,
    label: '1 · Subscription or API?',
    steps: 1,
    stage: () => sp(0.22, 0.85),
    notes: 'Part one, about five minutes. We start with our day-to-day as developers, before talking about production.',
    render: () => <Opener n={1} />,
  },
  {
    id: 'tools',
    section: 1,
    label: 'Claude Code and Codex',
    steps: 3,
    stage: () => sp(0.3, 0.5),
    notes:
      'To code with AI today, two tools are clearly ahead of the pack: Claude Code (Anthropic) and Codex (OpenAI). Lay the groundwork for those who don’t use them: an agent in the terminal or the editor that reads the code, runs commands and fixes things. STEP 2: far ahead of the rest. STEP 3: both are paid for with a monthly subscription. Claude: Pro $20, Max $100, Ultra $200. Codex goes through ChatGPT: Plus $20, Pro at $100, $200 or $500.',
    render: () => (
      <div className="pad tools">
        <div className="duo">
          <div className="tool">
            <div className="tool-head">
              <AppIcon kind="claude" delay={180} />
              <div>
                <Words className="tool-name" wordClass="g-ink" text="Claude Code" delay={320} />
                <R className="tool-by" delay={620} fx="fade">
                  Anthropic
                </R>
              </div>
            </div>
            <Plans list={PLANS.claude} />
          </div>
          <div className="tool">
            <div className="tool-head">
              <AppIcon kind="codex" delay={340} />
              <div>
                <Words className="tool-name" wordClass="g-ink" text="Codex" delay={480} />
                <R className="tool-by" delay={780} fx="fade">
                  OpenAI
                </R>
              </div>
            </div>
            <Plans list={PLANS.codex} />
          </div>
        </div>
        <R at={1} className="t-big verdict">
          Far ahead of the rest.
        </R>
        <Src at={2}>Monthly prices, individual plans. claude.com and chatgpt.com, November 2026.</Src>
      </div>
    ),
  },
  {
    id: 'billing',
    section: 1,
    label: 'Two ways to pay',
    steps: 2,
    stage: (s) => sp(s >= 1 ? 0.72 : 0.2, 0.5),
    notes:
      'Two billing models. The subscription: a fixed price per month, whatever the usage, with a ceiling (weekly limits). STEP 2: the API is the meter. You pay for every token, in and out, and there is no ceiling: the bill follows usage.',
    render: (s) => (
      <div className="pad billing">
        <Words as="h2" className="t-title" text="Two ways to pay" />
        <div className="chart">
          <svg viewBox="0 0 1680 620" aria-hidden="true">
            <path className={`axis ${s >= 0 ? 'on' : ''}`} d="M40 16 V580 H1664" />
            <path className={`ln flat ${s >= 0 ? 'on' : ''}`} pathLength={1} d="M40 372 H1150" />
            <path className={`cap ${s >= 0 ? 'on' : ''}`} d="M1150 336 V408" />
            <path id="api-line" className={`ln api ${s >= 1 ? 'on' : ''}`} pathLength={1} d="M40 580 L1500 60" />
            <g className={`flow ${s >= 1 ? 'on' : ''}`}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <circle key={i} r="9">
                  <animateMotion dur="3.5s" begin={`-${i * 0.5}s`} repeatCount="indefinite" path="M40 580 L1500 60" />
                </circle>
              ))}
            </g>
          </svg>
          <span className="axis-y">bill</span>
          <span className="axis-x">usage</span>
          <R className="tag tag-flat" delay={900}>
            <b className="c-cold">Subscription</b>
            <span>flat price, capped usage</span>
          </R>
          <R at={1} className="tag tag-api" delay={500}>
            <b className="c-hot">API</b>
            <span>per token, no cap</span>
          </R>
        </div>
      </div>
    ),
  },
  {
    id: 'token',
    section: 1,
    label: 'The token',
    steps: 2,
    stage: () => sp(0.45, 0.5),
    notes:
      'A reminder for those who don’t work with the API. The model doesn’t read words but tokens: pieces of words. Everything is counted in tokens, what you send and what it answers. STEP 2: prices are quoted per million tokens. Claude Opus 5.5: $4 per million input tokens, $20 for output. Output costs five times as much as input.',
    render: () => (
      <div className="pad token">
        <Words as="h2" className="t-title" text="What you pay for: tokens" accent={['tokens']} />
        <div className="chips">
          {CHIPS.map((c, i) => (
            <R key={i} fx="pop" className="chip mono" delay={650 + i * 95}>
              {c}
            </R>
          ))}
        </div>
        <div className="prices">
          <div className="price-model">
            <AppIcon kind="claude" at={1} delay={0} />
            <R at={1} className="price-model-name" delay={120} fx="fade">
              Claude Opus 5.5
            </R>
          </div>
          <R at={1} className="price" delay={200}>
            <span className="price-n g-ink">${fmt(API.opus.in)}</span>
            <span className="price-l">per M input tokens</span>
          </R>
          <R at={1} className="price" delay={360}>
            <span className="price-n g-hot">${fmt(API.opus.out)}</span>
            <span className="price-l">per M output tokens</span>
          </R>
        </div>
      </div>
    ),
  },
  {
    id: 'gap',
    section: 1,
    label: '$200 = $14,662',
    steps: 4,
    stage: (s) => sp(s >= 1 ? 0.92 : 0.2, s >= 1 ? 0.2 : 0.3, s >= 1 ? 'wall' : 'tile'),
    notes:
      'The number to remember from this part. A Claude Ultra subscription: $200 a month. The 200 points on screen are those $200. STEP 2: the same usage, billed at API prices, is worth $14,662. Each point is one dollar. A real measurement: 1.1 million requests between August and November 2026, using Opus 5.5 only. STEP 3: 73 times the price of the subscription. STEP 4: depending on the model, the ratio ranges from 11 to 73. Codex follows the same logic. Conclusion: for coding, take the subscription. The API is for production.',
    render: (s) => (
      <div className="gap">
        <div className="gap-left">
          <div className="gap-row">
            <div className={`gap-n swap ${s >= 1 ? 'burn' : ''}`}>
              <Num className="g-ink" value={s >= 1 ? ULTRA.opusOnly : ULTRA.price} prefix="$" duration={2.6} />
              <Num className="g-hot gap-hot" value={s >= 1 ? ULTRA.opusOnly : ULTRA.price} prefix="$" duration={2.6} />
            </div>
            {/* "/month" only applies to the subscription: it fades out when the number moves to API pricing. */}
            <R until={1} fx="fade" delay={300} className="gap-per g-ink">
              /month
            </R>
          </div>
          <div className="swap gap-cap">
            <R until={1} fx="fade" delay={500}>
              Claude Ultra subscription
            </R>
            <R at={1} fx="fade" delay={700}>
              The same usage, at API prices
            </R>
          </div>
        </div>
        <div className="gap-right">
          <R at={2} fx="pop" className="gap-x g-ink">
            ×{ULTRA.ratioMax}
          </R>
          <R at={3} fx="fade" className="gap-range">
            ×{ULTRA.ratioMin} to ×{ULTRA.ratioMax} depending on the model
          </R>
        </div>
        <R at={1} fx="fade" delay={1800} className="gap-legend">
          1 point = $1
        </R>
        <R at={1} fx="fade" delay={1200} className="src src-low">
          Opus 5.5 only, public pricing. Measured over 1.1{NB}million requests, August 11 to November 9, 2026.
        </R>
      </div>
    ),
  },
  {
    id: 'self-hosting',
    section: 1,
    label: 'Self-hosting',
    steps: 3,
    stage: (s) => sp(s >= 1 ? 0.85 : 0.35, 0.28, 'none', { racks: s >= 1 ? 1 : 0.13 }),
    notes:
      'The question always comes up: what if we hosted a model ourselves? STEP 2: to handle a real load with a decent model, you need GPUs, and quickly hundreds of thousands of euros of infrastructure. Not counting maintenance: updates, outages, scaling. STEP 3: our take is no, not for now. Below that budget, frustration is guaranteed: weaker, slower models. Paying per token or by subscription is still far more cost-effective.',
    render: () => (
      <div className="pad self-hosting">
        <Words as="h2" className="t-title" text="Host your own model?" />
        <R at={1} className="t-big host-line">
          Hundreds of thousands of euros.
          <br />
          <span className="c-2">Plus the maintenance.</span>
        </R>
        <R at={2} className="t-big host-verdict">
          Our take: <span className="c-hot">not today.</span>
        </R>
      </div>
    ),
  },
];
