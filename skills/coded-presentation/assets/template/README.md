# Presentation title

A deck you present from a browser: a local website with no network dependency once installed.

## Run

```bash
pnpm install
```

```bash
pnpm start
```

`pnpm start` builds the deck and opens it at http://localhost:5180. To work on it with hot reload: `pnpm dev`. `npm` works too.

Open it in Chrome or a recent Chromium-based browser: slide transitions use the View Transitions API. Elsewhere the deck works, but moves from one slide to the next without a transition.

## Keys

| Key | Effect |
|---|---|
| `→` `↓` `Space` `Enter` `Page Down` | Next step or slide (this is what a presentation remote sends) |
| `←` `↑` `Backspace` `Page Up` | Back |
| `F` | Fullscreen |
| `P` | Opens the presenter view in another window |
| `O` | Slide list, to jump to any slide during Q&A |
| `B` or `.` | Black screen |
| `Home` / `End` | First / last slide |

The address keeps your position (`#/7/2` = slide 7, step 3): reloading the page brings you back to the same place.

## Presenter view

`P` opens a second window: the slide's notes (the current step is highlighted), a timer, a preview and the next slide. Keep this window on the laptop screen and the deck fullscreen on the projector, in "extended desktop" mode. The two windows stay in sync, whichever one you press keys in.

In this view: `T` starts or pauses the timer, `R` resets it. It starts on its own at the first slide change.

## Edit

| What | Where |
|---|---|
| Slide text and speaker notes | `src/slides/`, one file per part |
| Slide order | `src/slides/index.ts` |
| Every number, with its source | `src/data/` |
| Layout of each slide | `src/styles/slides.css` |
| Colors, typography, transitions | `src/styles/base.css` |
| WebGL background, points, 3D objects | `src/stage/` |

In the notes, "STEP 2: " marks what to say after the second press on the slide.

The slide canvas is always 1920×1080 and scales to the screen; the WebGL background fills the whole window. Text sizes are in pixels of that canvas: 32 px minimum for anything that must be read from the room.

## Check

```bash
pnpm screenshots
```

builds the deck, then writes one 1920×1080 image per slide and per step to `screenshots/`, taken in a windowless Chrome. Other uses: `node tools/browser.mjs` lists them.

## Figures and sources

To fill in: for each number shown, its source and the date it was checked.

## Before you go on stage

- Test on the actual projector: the background is black with thin lines, check it in a lit room.
- Set the display to "extended desktop" (not mirroring) to get the presenter view on the laptop.
- Plug in the charger: the background and effects run continuously on the GPU.
- Re-check fast-moving numbers the day before.
