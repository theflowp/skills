# Pitfalls

Each point below is a defect actually encountered, then fixed. The template already contains the fixes; this list is there so you don't undo them, and so you recognize the same problem in a new visual.

## Contents

1. Checking for real
2. Text
3. SVG animations
4. Synchronization
5. Background and WebGL
6. Layout
7. Project

## 1. Checking for real

**A scaled-down screenshot doesn't show the defects.** A letter clipped by three pixels, a dot beside its path, a missing rectangle corner: invisible on an 800 px wide image, obvious on the room's screen. Check on the 1920×1080 screenshots from `pnpm screenshots`, and zoom further into the area if in doubt.

**A hidden browser pauses the deck.** In a hidden preview panel or a background tab, animations don't run: slides stay in their pre-entry state, and a script waiting for the next frame never finishes. If a measurement returns frozen values or a step of -1, that's why. `tools/browser.mjs` launches a browser that really runs.

**The WebGL background comes out black in a screenshot** taken by some tools. Add `?capture` to the address. The very first frame after loading can also be black: wait a second or two.

**Look at every step, not just the last one.** Two texts that take over from each other can overlap for the length of one step. `pnpm screenshots` plays the steps one by one for that reason.

**Change the window's shape.** The deck will be opened on a screen that isn't exactly 16:9. Also capture at `2560x1080` and `1280x800`: the background must fill the window, with no black bars on the sides.

**Go back.** Move to the next step and come back: nothing should replay or stay on screen.

## 2. Text

**The last letter of a gradient text is clipped.** A gradient (`g-ink`, `g-hot`, `g-cold`) is only painted inside the element's box, and the tight letter-spacing of large titles pushes the last letter past it. Same cause for the `Words` mask. The template enlarges the box with a `padding` offset by a negative margin: keep both lines on any new gradient or masked text class.

**An outlined number shows extra lines.** `-webkit-text-stroke` strokes every contour of the font, including where they overlap: the bar of the "4" crosses its stem. Invisible in pale gray, glaring in color. The template takes the outline from the filled shape (SVG filter `contour-hot` in `Opener`): keep that technique for any large outlined text.

**Zeros become slashed.** `font-variant-numeric: tabular-nums` changes how Mona Sans draws digits at heavy weights and wide widths. For a counting number, use `Num`, which gives each digit a fixed box without touching its design.

**A gap to the left of a large number starting with "1".** Digit boxes all the same width center the narrow "1" in a wide box: the number is no longer aligned with the text below. `Num` gives each box the actual width of the final digit at that position, measured in the font: once it lands, the number has natural spacing, with no jump at the end of the count. Its initial content is frozen, otherwise React rewrites it on the next render and the defect comes back at the next step.

**Thousands separators that vanish or widen depending on the machine.** Some locales (French, for instance) group thousands with a narrow no-break space (U+202F), which most fonts lack. `fmt()` replaces it with the ordinary no-break space and `Num` with a narrow box. Never type a large number by hand.

**A title wraps onto two lines without warning.** Shorten it, or reduce its size for that slide only, and check that what's below hasn't been pushed out of the frame. English strings are often longer or shorter than the language a deck was first written in: re-check every title after translating.

## 3. SVG animations

**An animated dot stays frozen in the top-left corner.** Before it starts, an element moved by `animateMotion` sits at (0, 0). For dots that loop, give them a negative start (`begin="-1.2s"`). For a dot that must leave at a precise moment, keep it invisible until then.

**A dot stays put, then jumps to the end.** `begin="indefinite"` followed by a `beginElement()` called too early, before the SVG has started its clock, gives exactly that. Call `beginElement()` one frame after display (`requestAnimationFrame` in a `useEffect`), not in a `useLayoutEffect`.

**A dot moves beside its path.** Don't add `cx` or `cy` to an element moved by `animateMotion`: they add to the path.

**A dot cuts corners instead of following the curve.** Its path was written separately, center to center, whereas the drawn link starts from the edge of a block. Build both from the same points.

**An animation meant to play once replays** when you come back to the step. Track with a ref whether the slide was entered at its first step and whether it has already been left (see `entry` and `left` in `Pipeline`).

## 4. Synchronization

**Elements flash with no relation to what they accompany.** Two animations started at different moments (one on mount, the other on a step change) are never in sync. Start them on the same event, and compute one's delay from the other's position: distance traveled divided by the path length, multiplied by the duration.

**A flash lasts too long at the ends.** An object that starts from the center of the first block and stops at the center of the last only crosses half of each.

**Check a synchronization by measuring it.** Record, on every frame, the object's position and the state of whatever must follow it, then count the mismatches (`node tools/browser.mjs measure`). The eye isn't enough, and a gap of a few frames shows on a big screen.

## 5. Background and WebGL

**Black bars on the left and right.** The WebGL render must cover the whole window, not just the slides' 16:9 frame. The template sets the camera's field of view so the slide canvas stays locked to the z = 0 plane; the background shader receives the visible size (`uView`). Don't put the WebGL canvas back inside the slide frame.

**The background looks like a starry sky.** Hundreds of small white dots spread everywhere produce that cliché. Few points, warmer and brighter toward the bottom, almost nothing at the top.

**The background is too pale or shows banding.** Prefer crisp lines to diffuse clouds: they hold up on a projector. Grain prevents gradient banding, but apply it only where there is light, to keep perfect black elsewhere.

**An incomplete rectangle of points.** A number that doesn't factor into rows and columns leaves a missing corner, which looks like a bug. Take the nearest full rectangle and tell the speaker about the difference.

**The background freezes during a slide change.** The slide transition captures an image of whatever takes part in it. Only `.slide` has a `view-transition-name`; the root is set to `none`, which leaves WebGL running underneath.

**"Transition was skipped" errors in the console.** A quick key press interrupts the running transition: its `ready` and `finished` promises reject. The template catches them.

## 6. Layout

**A centered element shifts as it appears.** `R` animates `transform`. Centering with `translate(-50%, -50%)` must be carried by a child element.

**Two texts of different sizes aren't aligned.** Their CSS boxes start from the same edge, but the letters don't. Causes encountered:
- the font's side bearing (the blank before the first letter) grows with size: a few pixels at 46 px, about ten at 240 px. For giant text above body text, compensate with a negative left margin in `em` on the giant text, tuned by measuring;
- the fixed-width boxes of a counting number center a narrow "1" in a wide box: about thirty pixels of empty space. `Num` sets each box to the final digit, keep it;
- the `padding` of gradient texts (`g-ink`, `g-hot`) is offset by a negative margin: don't remove one without the other;
- an icon or a logo has its own blank space around the drawing: crop the image to its visible edge;
- a leading currency symbol (`$`) has its own side bearing: measure the "$", not the first digit.
Always measure: on the 1920×1080 screenshot, find the first lit pixel column of each block at the height of its letters, and compare. Redo the measurement at every step of the slide, because a later render can undo a fix (it happened with `Num`).

**A caption touches a chart.** Work out the space before writing: widths in canvas pixels add up. Leave at least 40 px between two blocks.

**A source line overlaps a visual placed low.** The source occupies the band between 985 and 1020 px; the progress bars are at 1043.

**A piece of scenery is cut off sharply at the edge of the frame.** On a screen wider than 16:9, whatever extends beyond the slide canvas is visible. Don't put `overflow: hidden` on a whole slide.

## 7. Project

**`pnpm install` fails or installs elsewhere** when the deck sits inside another pnpm project's folder. The template's `pnpm-workspace.yaml` makes it a standalone project: keep it.

**No resource may come from the Internet.** Fonts installed through npm, no CDN, no remote image: venue wifi isn't reliable.

**A supplied image has an imperfect cutout.** Light fringe or dark shadow: invisible on white, glaring on black. Redraw it in HTML, CSS or SVG by measuring the original (positions, colors), and point out that the font may differ slightly.

**Slide transitions need Chrome or a Chromium-based browser.** Elsewhere, the deck works but moves between slides without a transition. Say so in the deck's README.
