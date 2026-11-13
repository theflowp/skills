import type { TokenLayout } from '../slides/types';

/**
 * The wall of points: COLS × ROWS points, the first TILE_COUNT of which form a separate tile
 * ("what you pay" versus "what it's worth", a sample versus the whole, and so on).
 * For one point to stand for one unit, pick COLS × ROWS as close as possible to the number shown:
 * an incomplete rectangle gets noticed and looks like a bug. Here 219 × 67 = 14,673 points.
 * Coordinates in canvas pixels, origin at the center, y pointing up.
 */
const COLS = 219;
const ROWS = 67;
export const TOKEN_COUNT = COLS * ROWS;
/** Must be a multiple of TILE_COLS (20). */
export const TILE_COUNT = 200;

export type Layout = {
  /** x, y, z, alpha par point. */
  pos: Float32Array;
  /** heat (-1 cold, 0 white, 1 ember), size, drift per point. */
  style: Float32Array;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = TOKEN_COUNT;

/** Four fixed random numbers per point: delay, curve, depth, phase. */
export const seeds = (() => {
  const r = mulberry32(7);
  const a = new Float32Array(N * 4);
  for (let i = 0; i < a.length; i++) a[i] = r();
  return a;
})();

function make(fill: (i: number, r: () => number) => [number, number, number, number, number, number, number], seed: number): Layout {
  const r = mulberry32(seed);
  const pos = new Float32Array(N * 4);
  const style = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const [x, y, z, a, heat, size, drift] = fill(i, r);
    pos.set([x, y, z, a], i * 4);
    style.set([heat, size, drift], i * 3);
  }
  return { pos, style };
}

const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(1 - r() * 0.999)) * Math.cos(2 * Math.PI * r());

/* Resting positions: a deep disc, wider than the screen. */
const dustAt = (r: () => number): [number, number, number] => {
  const rad = Math.sqrt(r()) * 1500;
  const th = r() * Math.PI * 2;
  return [Math.cos(th) * rad, Math.sin(th) * rad, -1300 + r() * 1700];
};

/* A few embers: sparse, hotter and brighter toward the bottom. */
const dust = make((_, r) => {
  const [x, y, z] = dustAt(r);
  const visible = r() < 0.022;
  const low = Math.min(1, Math.max(0, 0.5 - y / 1080));
  const a = visible ? (0.2 + 0.75 * r()) * low * low : 0;
  return [x, y, z, a, 0.25 + 0.75 * low * r(), 3 + r() * 5.5, 24];
}, 11);

const none: Layout = { pos: new Float32Array(dust.pos), style: new Float32Array(dust.style) };
for (let i = 0; i < N; i++) none.pos[i * 4 + 3] = 0;

/* The wall spans exactly the width of the slides' text: from 120 to 1800 px. */
const GAP = 1680 / COLS;
const WALL_X0 = -((COLS - 1) * GAP) / 2;
const WALL_Y0 = -420;
const TILE_COLS = 20;
const TILE_ROWS = TILE_COUNT / TILE_COLS;

const wall = (() => {
  // Free cells, sorted by distance to the $200 tile: the tide spreads out from it.
  const cells: { c: number; r: number; d: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < TILE_COLS && r < TILE_ROWS) continue;
      cells.push({ c, r, d: Math.hypot(c - TILE_COLS / 2, (r - TILE_ROWS / 2) * 1.6) });
    }
  }
  cells.sort((a, b) => a.d - b.d);
  // Points sorted by delay: the first to leave fill the closest cells.
  const order = Array.from({ length: N - TILE_COUNT }, (_, k) => k + TILE_COUNT).sort((a, b) => seeds[a * 4] - seeds[b * 4]);
  const cellOf = new Int32Array(N);
  order.forEach((i, k) => {
    cellOf[i] = k;
  });
  const maxD = cells[N - TILE_COUNT - 1].d;
  return make((i) => {
    if (i < TILE_COUNT) {
      const c = i % TILE_COLS;
      const r = Math.floor(i / TILE_COLS);
      return [WALL_X0 + c * GAP, WALL_Y0 + r * GAP, 0, 1, -0.75, 5.4, 0.3];
    }
    const cell = cells[cellOf[i]];
    const heat = 0.55 + 0.45 * (cell.d / maxD);
    return [WALL_X0 + cell.c * GAP, WALL_Y0 + cell.r * GAP, 0, 0.92, heat, 4.5, 0.3];
  }, 13);
})();

/* The tile on its own: 200 larger points, in the middle of the wall's area. */
const tile = make((i, r) => {
  if (i < TILE_COUNT) {
    const c = i % TILE_COLS;
    const row = Math.floor(i / TILE_COLS);
    const g = 15;
    return [(c - (TILE_COLS - 1) / 2) * g, -176 + (row - (TILE_ROWS - 1) / 2) * g, 0, 1, -0.75, 9.5, 0.4];
  }
  const [x, y, z] = dustAt(r);
  return [x * 1.25, y * 1.25 - 200, z, 0, 0.6, 4, 12];
}, 17);

/* Rings: the agent loop, then the context getting thicker. */
const ringOf = (radius: number, spread: number, share: number, heat: number, seed: number) =>
  make((_, r) => {
    const th = r() * Math.PI * 2;
    const rad = radius + gauss(r) * spread;
    const visible = r() < share;
    const a = visible ? 0.12 + Math.pow(r(), 2) * 0.8 : 0;
    return [Math.cos(th) * rad, Math.sin(th) * rad, gauss(r) * 50, a, heat * (0.5 + r() * 0.5), 2.6 + r() * 3.4, 5];
  }, seed);

const ring = ringOf(356, 14, 0.16, 0.25, 19);
const ringFat = ringOf(392, 62, 0.7, 1, 23);

export const layouts: Record<TokenLayout, Layout> = { none, dust, tile, wall, ring, ringFat };

/** Rotation speed of the cloud (rad/s). null: the cloud straightens up and stops turning. */
export const spin: Record<TokenLayout, number | null> = {
  none: 0.006,
  dust: 0.006,
  tile: null,
  wall: null,
  ring: 0.22,
  ringFat: 0.34,
};

/** Flight time between two layouts, in seconds. */
export const flight: Record<TokenLayout, number> = {
  none: 1.6,
  dust: 2.2,
  tile: 2.0,
  wall: 3.2,
  ring: 2.4,
  ringFat: 2.0,
};
