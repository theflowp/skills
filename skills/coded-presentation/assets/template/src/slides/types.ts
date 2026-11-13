import type { ReactNode } from 'react';

/** Layout of the points (1 point = $1) drawn by the WebGL background. */
export type TokenLayout = 'none' | 'dust' | 'tile' | 'wall' | 'ring' | 'ringFat';

/** State of the WebGL backdrop for a given slide and step. */
export type StageSpec = {
  /** 0 = cold (blue), 1 = hot (ember). The temperature follows the spending. */
  heat: number;
  /** Intensity of the background glow, 0 to 1. */
  glow: number;
  tokens: TokenLayout;
  /** Share of the server racks that are visible, 0 to 1. */
  racks?: number;
  /** Center of the point cloud, in pixels of the 1920×1080 canvas. */
  center?: [number, number];
};

export type SlideDef = {
  id: string;
  /** 0 = outside any part (opening, closing); 1, 2, 3… = part number. */
  section: number;
  /** Short name, for the overview and the presenter view. */
  label: string;
  /** Number of steps (presses of "next") in the slide. */
  steps: number;
  stage: (step: number) => StageSpec;
  /** Speaker notes. */
  notes: string;
  render: (step: number) => ReactNode;
};

export const sp = (
  heat: number,
  glow: number,
  tokens: TokenLayout = 'dust',
  extra: Partial<StageSpec> = {},
): StageSpec => ({ heat, glow, tokens, ...extra });
