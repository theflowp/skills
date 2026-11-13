# Style rules

These rules come from feedback given on real decks, slide by slide. Each has a reason: the deck is projected in a large room, in front of people who are listening to someone speak. The screen supports the speaker; it doesn't replace them.

## Contents

1. Text
2. Sizes
3. Typography
4. Colors and background
5. Motion
6. Numbers and sources
7. Speaker notes
8. What gives away a mass-produced deck

## 1. Text

- **One idea per slide, in a few words.** "2022 | It answers | Generative AI" rather than a full sentence. If a slide needs three sentences, that's three steps or three slides.
- **No kicker.** No small text above a title: no "TO BEGIN", no "Part 2", no "Benefits · 1/2". If a context marker is really useful, it goes at the bottom of the slide. The giant number on part-opener slides is a drawing, not a kicker: it is allowed.
- **A title names its subject.** "A wholesaler’s routine" replaced "Monday, 7 a.m.", which was found off-putting: no staging, no narrative hook, no artificial suspense.
- **Nothing cringe.** No line that strains for effect, no rhetorical question followed by its answer, no slogan. Judge a sentence like this: would the speaker say it as is to a colleague?
- **The speaker’s point of view is written in the first person** when it is one: "My take: not today."
- **The speaker’s words first.** Reuse their terms. Only fix what is actually a mistake ("could have", not "could of") and point it out.
- **Details and nuances go in the notes**, not on screen: names mentioned, anecdotes, secondary figures.

## 2. Sizes

The canvas is 1920×1080 pixels and scales to the screen. The sizes below are in canvas pixels.

| Use | Class | Size |
|---|---|---|
| Giant word or number | `.t-hero` | 160 to 240 |
| Slide title | `.t-title` | 100 to 112 |
| Strong sentence | `.t-big` | 62 to 76 |
| Body text | `.t-body` | 42 to 46 |
| Captions, diagram labels | | 32 minimum |
| Source at the bottom of the slide | `.src` | 25 (it is for people re-reading the deck, not for the room) |

**Everything that is aligned must be aligned to the pixel**, even between texts of very different sizes: a giant number and its caption, a title and the sentence below it, an icon and the name under it. On a ten-foot screen, a 20 px offset between two left edges shows from the back of the room and looks sloppy. Alignment is judged on what the eye sees (the edge of the letter), not on the CSS box: see `pitfalls.md`, "Layout" section.

Nothing that must be read from the room goes below 32. A title fits on one line if possible, two at most: if it overflows, shorten it before shrinking it.

## 3. Typography

- **Numbers are never typed by hand.** Use `fmt()` and `Num`, which format them in the deck's locale (`LOCALE` in `src/deck/ui.tsx`, `en-US` by default: `14,662`, `0.74`). Decimals: `fmt(value, 2)`.
- **Currency follows the language.** In English the symbol comes first, with no space: `$200`. With `Num`, pass it as `prefix="$"`.
- **Keep a number with its unit** using the non-breaking space `NB` (`1.1${NB}million`, `25${NB}min`), so a line never breaks between them.
- **Curly quotes and apostrophes** (“ ” ’), not straight ones, in on-screen text.
- **No final period on a one-sentence title** ("Routing tasks", "Caching"). The period stays when the title has two sentences or more. Question marks and exclamation marks stay. Body sentences under the title keep their period.
- If the deck is in another language, follow that language's rules (in French, for instance, a non-breaking space before `:` `?` `!` and before units, and `LOCALE = 'fr-FR'`).

## 4. Colors and background

- **Pure black background.** On a projector, pure black emits nothing: it is the sharpest background. The shader's grain only applies where there is light.
- **Off-white for text**, gray for secondary text (`.c-2`).
- **Two accents that carry meaning**, not decoration: in the example, ember (`.g-hot`, `.c-hot`) marks what costs money, cold (`.g-cold`, `.c-cold`) what is under control. Choose what the two accents mean for your talk and stick to it everywhere. If the subject calls for other hues, change them in `base.css` and in the shaders.
- **The background must never look like a starry sky** or a purple gradient: those are the two clichés. The template's thin isotherms were chosen because they look drawn. They are bright at the bottom of the screen and fade behind the text.

- **Logos and icons: faithful to the original.** A logo redrawn "roughly" is spotted immediately. The safest is the original file (installed app, logo package, the brand's press kit). An SVG redraw also works, provided it is exact: same proportions, same colors, same drawing, checked side by side with the original, enlarged. See `visual-recipes.md`.

## 5. Motion

- Everything that appears does so for a reason: in the order the speaker talks about it.
- An effect accompanies what it illustrates, to the instant. A block that lights up with no visible link to the dot passing through it looks like a bug.
- A build animation plays once. Going back doesn't replay it.
- No permanent effect that draws the eye while the speaker talks: background motion is slow.
- One or two highlight moments per talk. If there is one per slide, there are none.

## 6. Numbers and sources

- **Check on the day** every price, date, version and quote, at the source. Prices in a fast-moving field go stale within weeks.
- **All numbers live in `src/data/`**, with their source and date. Slides read them; they don't copy them.
- **The source appears at the bottom of the slide** that shows the number: origin, scope, date.
- **A worked example is not a measurement.** Write "Worked example:" followed by its assumptions, at the bottom of the slide. Have the code do the calculation from the assumptions, so it stays right if they change.
- **Don't invent any number.** Without real data, compare with words ("High" versus "Low") and let the speaker give the order of magnitude out loud.
- **Keep the source's currency and unit.** If the source is in dollars, so is the slide; flag it if the person was talking in euros.
- **A client is never named** without explicit consent, and nothing should make them recognizable (precise industry, city, size, proprietary method). Describe the situation generically.
- **An illustration can be approximate if it says so or if the gap is invisible**: a rectangle of 14,673 points for 14,662 was preferred to a rectangle with a missing corner, at the speaker's request. Tell them when you make that choice.
- **A supplied image with an imperfect cutout** (light fringe, shadow) doesn't work on black: redraw it in HTML, CSS or SVG by measuring its proportions and colors on the original, and say so.

## 7. Speaker notes

Every slide has notes, shown in the presenter view. They say what to say, not what is written. For a slide with steps, split them like this: the text before the first press, then `STEP 2: ` before what follows the second press, `STEP 3: `, and so on. The presenter view highlights the current step.

Put in them the exact figures, the sources cited out loud, the names you don't show, and the transition to the next slide.

## 8. What gives away a mass-produced deck

Avoid these, because the room has seen them a hundred times:

- all-purpose fonts (Inter, Roboto, Arial) and a purple gradient on white;
- three cards side by side with an icon, a title and two lines;
- bullet points;
- a decorative pictogram for every title;
- a galaxy-style particle background;
- percentages and "+37%" with no source;
- a "Thank you!" slide with an emoji.
