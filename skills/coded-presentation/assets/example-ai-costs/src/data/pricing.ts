/**
 * Every number shown in the deck comes from here.
 * Checked on November 11, 2026. Prices are in US dollars, excluding tax.
 */
export const CHECKED_ON = 'November 11, 2026';

/** Individual subscriptions, per month. Sources: claude.com/pricing, learn.chatgpt.com/docs/pricing */
export const PLANS = {
  claude: [
    { name: 'Pro', usd: 20 },
    { name: 'Max', usd: 100 },
    { name: 'Ultra', usd: 200 },
  ],
  codex: [
    { name: 'Plus', usd: 20 },
    { name: 'Pro', usd: 100 },
    { name: 'Pro', usd: 200 },
    { name: 'Pro', usd: 500 },
  ],
};

/**
 * What one month of Claude Ultra ($200) is worth at API prices.
 * Source: the account's usage dashboard (references/claude-code-ultra-credits.jpeg in the original talk, not included)
 * (1.1 million requests measured, August 11 to November 9, 2026).
 */
export const ULTRA = {
  price: 200,
  opusOnly: 14_662, // ×73
  fable52Only: 3_021, // ×15
  fable51Only: 2_197, // ×11
  ratioMax: 73,
  ratioMin: 11,
};

/** Anthropic API prices, in $ per million tokens. Source: platform.claude.com, public pricing. */
export const API = {
  haiku: { name: 'Haiku 5.5', in: 0.1, out: 0.5 },
  sonnet: { name: 'Sonnet 5.5', in: 2, out: 10 },
  opus: { name: 'Opus 5.5', in: 4, out: 20, cacheRead: 0.2, cacheWrite: 5 },
  fable: { name: 'Fable 5.2', in: 8, out: 40 },
};

/** Output price per million tokens on OpenRouter (openrouter.ai/api/v1/models), November 11, 2026. */
/** Vendor logo, in src/assets/logos (official logos, @lobehub/icons-static-svg package, MIT). */
export type LogoId = 'claude' | 'openai' | 'kimi' | 'qwen' | 'deepseek' | 'mistral';

export const OPENROUTER: { name: string; out: number; open: boolean; logo: LogoId }[] = [
  { name: 'Claude Opus 5.5', out: 20, open: false, logo: 'claude' },
  { name: 'GPT-6.1 Sol', out: 10, open: false, logo: 'openai' },
  { name: 'Kimi K3.1 Pro', out: 10, open: true, logo: 'kimi' },
  { name: 'Qwen3.8 Max', out: 6, open: false, logo: 'qwen' },
  { name: 'DeepSeek V4 Pro', out: 4.44, open: true, logo: 'deepseek' },
  { name: 'Mistral Large 4', out: 2.1, open: true, logo: 'mistral' },
  { name: 'DeepSeek V4.1 Flash', out: 0.57, open: true, logo: 'deepseek' },
];

/* ------------------------------------------------------------------ */
/* Worked example: an agent that chains 25 tool calls.                */
/* ------------------------------------------------------------------ */

export const EXAMPLE = {
  /** Starting context: instructions, tool definitions, task. */
  baseTokens: 20_000,
  /** What each tool call adds to the context (call + result). */
  tokensPerCall: 4_000,
  /** Output tokens per tool call. */
  outPerCall: 400,
  toolCalls: 25,
  /** Tool calls grouped per turn when running them in parallel. */
  parallel: 5,
  runsPerDay: 10,
  daysPerMonth: 30,
};

export type Turn = { cached: number; fresh: number };

function turns(count: number, addPerTurn: number): Turn[] {
  return Array.from({ length: count }, (_, i) => ({
    cached: i === 0 ? 0 : EXAMPLE.baseTokens + addPerTurn * (i - 1),
    fresh: i === 0 ? EXAMPLE.baseTokens : addPerTurn,
  }));
}

function cost(list: Turn[], cache: boolean) {
  const { opus } = API;
  const out = (EXAMPLE.toolCalls * EXAMPLE.outPerCall * opus.out) / 1e6;
  const input = list.reduce((sum, t) => {
    if (!cache) return sum + ((t.cached + t.fresh) * opus.in) / 1e6;
    return sum + (t.cached * opus.cacheRead + t.fresh * opus.cacheWrite) / 1e6;
  }, 0);
  return input + out;
}

const sequential = turns(EXAMPLE.toolCalls, EXAMPLE.tokensPerCall);
const grouped = turns(EXAMPLE.toolCalls / EXAMPLE.parallel, EXAMPLE.tokensPerCall * EXAMPLE.parallel);

export const AGENT = {
  sequential,
  grouped,
  /** $7.00: every turn resends the whole context at full price. */
  costNaive: cost(sequential, false),
  /** $1.10: context that was already read is billed at the cache price. */
  costCached: cost(sequential, true),
  /** $0.74: cache + 5 tool calls per turn. */
  costParallel: cost(grouped, true),
  maxTokens: Math.max(...sequential.map((t) => t.cached + t.fresh)),
};

export const PROD = {
  perRun: AGENT.costNaive,
  perDay: AGENT.costNaive * EXAMPLE.runsPerDay,
  perMonth: AGENT.costNaive * EXAMPLE.runsPerDay * EXAMPLE.daysPerMonth,
};
