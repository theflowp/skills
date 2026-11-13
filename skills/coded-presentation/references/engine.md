# The engine

How a deck built from the template is made, and how to write in it.

## Contents

1. The files
2. Writing a slide
3. Steps
4. Display building blocks
5. Style classes
6. Driving the background
7. Adding a point layout or a 3D object
8. Transitions, navigation, addresses
9. Presenter view
10. The checking tool

## 1. The files

| File | Role | Do you touch it? |
|---|---|---|
| `src/slides/index.ts` | The slide order | Yes |
| `src/slides/*.tsx` | One part of the talk per file: text, steps, notes, visuals | Yes, that's most of the work |
| `src/slides/types.ts` | The `SlideDef` type, the background setting `sp()` | To add a point layout |
| `src/data/*.ts` | Every number, with sources and dates | Yes |
| `src/styles/slides.css` | The layout of each slide, in canvas pixels | Yes |
| `src/styles/base.css` | Colors, typography, reveals, transitions | To change the visual identity |
| `src/deck/ui.tsx` | `R`, `Words`, `Num`, `Src`, `fmt`, `NB`, `LOCALE` | Rarely |
| `src/deck/store.ts`, `keys.ts` | Navigation, address, sync between windows | No |
| `src/deck/Presenter.tsx` | Presenter view | No |
| `src/stage/Stage.tsx` | The WebGL render: background, points, racks | For a new 3D object |
| `src/stage/shaders.ts` | The background shader and the point shaders | To change the atmosphere |
| `src/stage/layouts.ts` | The point layouts | For a new highlight moment |
| `tools/browser.mjs` | Full-size screenshots and measurements | No |

The slide canvas is always 1920×1080 and scales to the window. The WebGL background, on the other hand, fills the whole window: on a screen wider or taller than 16:9, the scenery carries on around the slides.

## 2. Writing a slide

```tsx
{
  id: 'cache',                     // unique; used as a class name (.slide-cache) and a screenshot name
  section: 2,                      // 0 = outside any part (opening, closing); 1, 2, 3… = part number
  label: 'Caching',                // short name, for the slide list and the presenter view
  steps: 2,                        // number of presses the slide takes (1 minimum)
  stage: (s) => sp(s >= 1 ? 0.1 : 1, 0.7),   // the background, per step
  notes: 'What you say first. STEP 2: what you say after the second press.',
  render: (s) => (
    <div className="pad">
      <Words as="h2" className="t-title" text="Caching" />
      <R at={1} className="t-big">What was already read costs twenty times less.</R>
    </div>
  ),
}
```

Add it to the array in its part's file; the final order is read from `src/slides/index.ts`. The progress bars at the bottom of the screen are derived from the `section` values on their own.

`<div className="pad">` places the content within the margins (120 px left and right, 96 at the top). For pixel-exact placement (a diagram next to a text, an element aligned with the WebGL background), use a `position: absolute; inset: 0` container and canvas coordinates.

A slide's layout goes in `src/styles/slides.css`, under a comment with its name.

## 3. Steps

A slide with `steps: 3` takes three presses. `render(s)` and `stage(s)` receive the current step: 0, 1, 2.

- **`s` is -1 for a brief moment on arrival on the slide.** That's intentional: everything at step 0 starts from its hidden state and animates in. So every condition is written `s >= 1`, never `s === 1`, and `Math.max(0, s)` is used as an array index.
- Going back to a slide shows it at its last step, fully built.
- Inside a component, `useStep()` gives the step without passing it through props.
- State that animates something continuously (a turn counter) is written with `useEffect` and `setInterval`, cleaned up on unmount: see `useTicker` in the example (`part2.tsx`).

## 4. Display building blocks

They all come from `src/deck/ui.tsx`.

**`<R>`** reveals its content at a step.

```tsx
<R at={1} until={3} delay={200} fx="pop" as="li" className="…">…</R>
```

`at`: step at which it appears (0 by default). `until`: step at which it disappears. `delay`: milliseconds. `fx`: `rise` (moves up, default), `fade`, `pop` (scales up), `left`. `as`: `div`, `span`, `p`, `li`.

`R` animates the `transform` property. An element that needs its own `transform` (centering with `translate(-50%, -50%)`) carries it on a **child** element, not on the `R`.

**`<Words>`** reveals a title word by word, each word rising out of a mask.

```tsx
<Words as="h2" className="t-title kin" wordClass="g-ink" text="Questions?" delay={200} stagger={110} />
```

`wordClass` applies a gradient to each word. The `kin` class widens the letters on arrival (variable font): keep it for giant titles. A non-breaking space keeps two words together (`` `1.1${NB}million` ``). To color one or two words of a title orange, pass them in `accent` (`accent={['tokens']}`): they get the `g-hot` gradient. To force a line break, write `\n` in the text (`` 'Subscription\nor API?' ``): elsewhere, in ordinary HTML text, that `\n` reads as a space, which lets you reuse the same label on a single line (the outline).

**`<Num>`** shows a number that counts to its new value when `value` changes.

```tsx
<Num className="g-hot" value={s >= 1 ? 14662 : 200} decimals={0} prefix="$" duration={2.6} />
```

Each digit sits in a fixed-width box: the number doesn't jitter while it counts.

**`<Src>`** places a source line at the bottom of the slide. **`fmt(value, decimals)`** formats a number in the deck's locale (`LOCALE`, `en-US` by default). **`NB`** is the non-breaking space.

**Stacking elements shown one after another**: a `className="swap"` container and, inside it, `R` elements with `at` and `until` that take over from each other. They occupy the same spot.

## 5. Style classes

| Class | Effect |
|---|---|
| `t-hero`, `t-title`, `t-big`, `t-body` | The type scale |
| `mono` | Monospaced font, for prices in a chart |
| `g-ink`, `g-hot`, `g-cold` | Gradient text: white, ember, cold |
| `c-hot`, `c-cold`, `c-2` | Solid color: ember, cold, secondary gray |
| `swap` | Stacks its children |
| `src` | Source line |
| `legend` with `span`s of class `k-hot` or `k-cold` | Chart legend with color swatches |

## 6. Driving the background

`stage: (s) => sp(heat, glow, points, options)` describes the scenery for each step. The engine moves smoothly from one state to the next, even when you change slides mid-motion.

- **`heat`**, from 0 to 1: the background's hue, from cold to ember. It is the talk's common thread: make it follow the argument (in the example, the spending). A slide that "cools down" from one step to the next gets noticed in the room.
- **`glow`**, from 0 to 1: the intensity. High on title and part-opener slides (0.85 to 1), medium elsewhere (0.4 to 0.6), low when points or a 3D object fill the bottom of the screen (0.2 to 0.3).
- **`points`**: the point layout.
  - `'dust'` (default): a few scattered embers.
  - `'none'`: no points, for a slide heavy with diagrams.
  - `'tile'` then `'wall'`: a tile, then the whole wall. The "a small number versus a large one" highlight moment.
  - `'ring'` then `'ringFat'`: a rotating ring, which then thickens. Positioned with `center`.
- **`options`**: `{ center: [x, y] }` moves the point cloud (canvas pixels); `{ racks: 0 to 1 }` raises the 3D server racks from the floor.

The scene's z = 0 plane coincides with the canvas: a point placed at (x, y) lands pixel-perfect under the HTML element placed at the same spot. That's what lets you align the wall of points with a caption.

## 7. Adding a point layout or a 3D object

**A point layout** (`src/stage/layouts.ts`) is a function that gives each point its position, opacity, heat, size and drift:

```ts
const column = make((i, r) => [x, y, z, opacity, heat, size, drift], seed);
```

Add its name to the `TokenLayout` type (`src/slides/types.ts`), then to the three tables in `layouts.ts`: `layouts`, `spin` (rotation speed, or `null` if the shape must stay upright) and `flight` (flight time from the previous layout). The number of points is fixed (`TOKEN_COUNT`): a shape that uses fewer sets the others to opacity 0.

For a wall of points to represent a number, set `COLS` and `ROWS` as close as possible to that number: the rectangle must be full.

**A 3D object** follows the model of `Racks` in `Stage.tsx`: an instanced mesh, a shader, a value from 0 to 1 driven by the background setting. Add its field to `StageSpec`.

**Changing the background's atmosphere**: the `backdropFrag` shader in `shaders.ts`. Keep what has been learned: crisp lines rather than clouds, the light at the bottom and a dark center, grain only where there is light.

## 8. Transitions, navigation, addresses

Moving from one slide to another uses the View Transitions API (Chrome and Chromium-based browsers). Only the slide takes part in the transition; the WebGL background keeps running underneath. Between steps, it's the CSS transitions of `R` and `Words` that play.

| Key | Effect |
|---|---|
| `→` `↓` `Space` `Enter` `Page Down` | Next step or slide (what a remote sends) |
| `←` `↑` `Backspace` `Page Up` | Back |
| `F` | Fullscreen |
| `P` | Presenter view |
| `O` | Slide list |
| `B` or `.` | Black screen |

The address keeps the position: `#/7/2` is slide 7 at its third step. Parameters: `?presenter` (presenter view), `?nostage` (no WebGL), `?capture` (keeps the WebGL image in memory so a screenshot can see it).

`window.__deck` exposes `slides`, `state()`, `goto(index, step)`, `next()` and `prev()` for tools.

## 9. Presenter view

`P` opens a second window: the notes (current step highlighted), a timer, a preview and the next slide. The two windows follow each other. The timer starts at the first slide change; `T` pauses it, `R` resets it. The target length is set in `Presenter.tsx` (`TARGET_MIN`).

## 10. The checking tool

`tools/browser.mjs` drives a windowless Chrome. It needs Node 22 or later and a Chromium-based browser (path in `CHROME_PATH` if it isn't found).

```bash
pnpm screenshots                                              # build, then one image per slide and per step
node tools/browser.mjs screenshots --slides 7,12-14           # only some slides
node tools/browser.mjs screenshots --steps final --size 2560x1080 --out screenshots-wide
node tools/browser.mjs screenshots --url http://localhost:5180   # against the dev server
node tools/browser.mjs measure --slide 22 --script measure.js
```

Images are named `<number>-<id>.png`, or `<number>-<id>-s<step>.png` for slides with several steps.

`measure` runs the contents of a file inside the slide (an expression, usually `(async () => { … })()`) and prints what it returns. That's how you check a synchronization: record, on every frame, the position of one element and the state of another, then count the mismatches. The tool also reports errors from the browser console and exits with a failure when there are any.
