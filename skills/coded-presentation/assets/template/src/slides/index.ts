import { closing } from './closing';
import { opening } from './opening';
import { part1 } from './part1';
import { part2 } from './part2';
import type { SlideDef } from './types';

/** The deck's order. Adding, moving or removing a slide happens here and in its part's file. */
export const slides: SlideDef[] = [...opening, ...part1, ...part2, ...closing];
