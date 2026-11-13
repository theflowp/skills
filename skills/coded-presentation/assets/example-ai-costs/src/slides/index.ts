import { intro } from './intro';
import { part1 } from './part1';
import { part2 } from './part2';
import { part3 } from './part3';
import { outro, part4 } from './part4';
import type { SlideDef } from './types';

/** The deck's order. Moving, removing or adding a slide happens here and in its part's file. */
export const slides: SlideDef[] = [...intro, ...part1, ...part2, ...part3, ...part4, ...outro];
