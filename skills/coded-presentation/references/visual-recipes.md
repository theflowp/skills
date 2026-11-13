# Visual recipes

The example deck (`assets/example-ai-costs/`) contains about twenty visuals that have already been polished. Before inventing one, look here for the one that says the same thing: copying and adapting it costs a tenth of redoing it, and it has already been cleaned of its defects.

To see it run: `bash scripts/new-deck.sh <folder> --example`, then `pnpm install` and `pnpm dev`.

Each visual has its code in `src/slides/` and its layout in `src/styles/slides.css`, under a comment with its name. Copy both.

## Choosing a visual

Start from what the slide must get across, not from the effect.

| What you want to show | Recipe | File, slide |
|---|---|---|
| A small number versus a large one | Wall of points | `part1.tsx`, `gap` |
| Two ways of doing things that diverge | Two curves that draw themselves | `part1.tsx`, `billing` |
| A price, a rate | Giant numbers and their unit | `part1.tsx`, `token` |
| Two products, two options | Two giant names and their prices | `part1.tsx`, `tools` |
| A piece of software, an app | Its real app icon, swaying | `part1.tsx`, `AppIcon` |
| AI models from several vendors | Vendor logo in front of each name | `part3.tsx`, `Prices` |
| Something too expensive, too heavy | 3D object that multiplies | `part1.tsx`, `self-hosting` |
| A cycle, a loop | Orbit diagram and counter | `part2.tsx`, `Loop` |
| A quantity that builds up, then gets cut | Staircase bars over several steps | `part2.tsx`, `Stairs` |
| A total that grows step by step | List and giant number | `part2.tsx`, `Prod` |
| Values to compare | Vertical bars | `part3.tsx`, `Ladder` |
| Dispatching, sorting | Dots splitting across lanes | `part3.tsx`, `Router` |
| A ranking, market prices | Horizontal bars | `part3.tsx`, `Prices` |
| A promise versus reality | Two bars, one of which drops | `part3.tsx`, `benchmaxxed` |
| A loss along the way | Three grids of dots that empty out | `part3.tsx`, `Dots` |
| A centralized system churning | Hub, spokes, a racing counter | `part4.tsx`, `AgentOnly` |
| A step-by-step process | Chain of blocks traveled by a ball | `part4.tsx`, `Pipeline` |
| Something being built | The same chain, drawn by an ember | `part4.tsx`, `Pipeline build` |
| Before and after, two approaches | Table of giant words | `part4.tsx`, `comparison` |
| A logo, a badge, a brand | Embossed object that tilts | `part4.tsx`, `ClubBadge` |
| Setting up a situation | Three lines arriving one by one | `part4.tsx`, `scenario` |
| What to remember | Three numbered lines | `part4.tsx`, `takeaways` |

## Notes on the recipes that need care

**Wall of points (`gap`).** The background goes from `'tile'` to `'wall'`; the number counts with `Num`; two stacked `Num`s (white, then ember) hand over with a crossfade, because a text gradient can't be animated. Set `COLS`, `ROWS` and `TILE_COUNT` in `layouts.ts` to your numbers. The wall is aligned with the text margins (from 120 to 1800 px): keep that alignment.

**Curves (`billing`).** An SVG path draws itself by animating `stroke-dashoffset` from 1 to 0, with `pathLength={1}` on the path. The moving dots are `animateMotion`s with a **negative** start (`begin="-1.5s"`): with a positive start, they wait their turn in the corner of the drawing.

**Staircase bars (`Stairs`).** Three states on a single slide: the same visual, with the title and total changing. The bars are fixed-height `div`s, revealed with `scaleY`; their two segments change color through a class. The second set of bars replaces the first with a crossfade. The background heat drops when the cost drops: that's the step the room remembers.

**Chain of blocks (`Pipeline`).** The blocks are HTML laid over an SVG that carries the links and the ball. Three things to respect:

- the ball follows the links' path **exactly**: its path is built from the same points as the links (function `runFrom`), never redrawn separately;
- a block lights up while the ball crosses it: its animation delay is computed from the distance traveled (`enterAt`), and the ball and the flash start at the same instant;
- the first and last blocks light up half as long, since the ball starts from the center of one and stops at the center of the other.

**Chain that builds itself (`Pipeline build`).** An ember travels the path; each block and each link has a delay computed from the distance (`reach`, `msAt`), so it appears the instant the ember passes. It is drawn on top of the blocks and fades out on arrival. It plays only once: coming back to the step doesn't restart it.

**3D object (`self-hosting`).** The racks rise from the floor one after another as `racks` goes from 0.13 to 1. They fill the bottom half of the screen: the text fits in the top half.

**Embossed badge (`ClubBadge`).** Rebuilt in HTML and CSS from an image whose cutout didn't work on black. Positions and colors measured on the original, text width adjusted with the font's width axis. The edge is a stack of plates offset in depth; the highlight is a gradient in `overlay` mode, which brightens the background without washing out the text.

**App icon (`AppIcon`).** In the example, these are the real icons, as PNGs in `src/assets/`: a first, approximate redraw had been judged "close but not exact". A faithful SVG redraw is still possible (it lends itself better to lighting effects), but compare it with the enlarged original before keeping it. On a Mac, an installed app's icon can be obtained at 1024 px with `NSWorkspace.shared.icon(forFile:)` (a small Swift script), then cropped to the edge of the rounded square; some apps also ship their icons in `Contents/Resources`. The 3D sway is carried by a child of `R`, otherwise it fights the reveal. Placed above the name, it doesn't widen the column; next to a giant name, redo the sum of the widths.

**Logo in front of a model name (`Prices`, `Ladder`).** The official logos of AI vendors are in the npm package `@lobehub/icons-static-svg` (MIT): the `-color` version when there is one, copied into `src/assets/logos/` to stay offline. Black logos (`fill="currentColor"`, or a path with no color) vanish on the background: replace the color with the text's off-white. Size: `0.82em` of the name, a gap of 12 to 20 px.

## Inventing a visual

When no recipe fits:

1. **Write in one sentence what the room must understand.** If the sentence contains "and", that's two visuals.
2. **Draw the final state first**, still, and check that it reads from a distance. A still image that can't be read doesn't become readable by moving.
3. **Decide what moves, and why.** Motion shows a change (a quantity grows, one thing becomes another) or an order (this, then that).
4. **Pick the simplest technique that does the job**: CSS transitions driven by the step; SVG for paths and objects that follow a path; WebGL only for thousands of elements or 3D.
5. **Make everything depend on the data**: heights, positions and delays are computed from `src/data/` and from the geometry, never by hand.
6. **Check it at every step, then going backward.**
