---
name: coded-presentation
description: "Builds a keynote-grade coded presentation: a local website (Vite + React) instead of a PowerPoint, with a WebGL shader background, slide transitions, step-by-step text reveals, counting numbers, 3D moments, speaker notes and a presenter view. Ships a ready-to-copy template, a complete example deck, style rules (short, very large text, no kickers above titles, nothing cringe) and a tool that screenshots every slide at full size. Use it whenever someone asks for a presentation, deck, slides, keynote, talk or pitch that should impress the room (\"wow effect\", \"Apple-level\", \"not a PowerPoint\", \"in code\", web deck), even if they never say \"code\", and to edit a deck built from this template. Not for a .pptx file or a document meant for print. Triggers: presentation, deck, slides, keynote, talk, conference talk, pitch, coded presentation, web deck, wow effect, WebGL, shader."
metadata:
  version: "1.1"
  origin: "Deck “AI in production: what it really costs”, presented at a tech meetup, November 2026"
---

# Coded presentation

You build a presentation that is projected from a browser: a local, offline website driven by the keyboard or a presentation remote. It does what a PowerPoint can't (a living background, objects that transform from one step to the next, 3D) without ever getting in the way of reading from the back of the room.

This skill contains an engine that has already been used in front of a real audience. Your job is not to rewrite it, but to write the content, find the talk's visual idea and check every slide up close.

## What the skill contains

| Path | What it is for |
|---|---|
| `scripts/new-deck.sh` | Creates the project from the template |
| `assets/template/` | The engine and ten starter slides to replace |
| `assets/example-ai-costs/` | A complete 27-slide deck: the library of visuals to reuse |
| `references/style-rules.md` | Text, sizes, colors, honest numbers. **Read it before writing the first slide** |
| `references/engine.md` | How to write a slide, drive the background, add a point layout |
| `references/visual-recipes.md` | Every visual in the example: what it shows, where its code is, how to adapt it |
| `references/pitfalls.md` | Defects already encountered and how they were fixed. **Read it before checking** |

## Workflow

### 1. Scope

Read everything the person provided (outline, length, audience, venue, reference files) and infer the rest. Only ask the questions whose answers belong to them and change what you build:

- the exact title, if it is already in a program;
- anything that needs a network, an account or a key (audience voting, a live demo): default to a fully offline deck, because venue wifi fails;
- numbers only they can know (results from a project, a client).

For everything else, decide and say what you decided. A whole deck is easier to judge than a list of questions.

### 2. Check the facts before writing

A wrong number projected large in front of people from the field ruins the rest of the talk. Check every price, date, product name and quote at its source, on the day, then store them in `src/data/` with the source and the date. Re-read a quote on its original page rather than in a summary. The full rules (worked examples, unnamed clients, currencies) are in `references/style-rules.md`.

### 3. Write the run-through

Before any code, write the list of slides: for each one, the on-screen text (a few words), its steps, what the speaker says at each step, and the visual. Follow the order of the outline you were given, but group or split its points freely: one outline point is not one slide. Count roughly one slide per minute, more if they have steps.

### 4. Create the project

```bash
bash <skill-folder>/scripts/new-deck.sh <deck-folder>
```

Then, in the deck folder: `pnpm install` (or `npm install`) and `pnpm dev`. The deck opens at http://localhost:5180. To run the full example alongside: the same script with `--example`, pointed at another folder.

### 5. Find the talk's visual idea

This is the step that separates a memorable deck from a merely clean one. Look for **one** correspondence between the background and the message that holds from start to finish. In the example, the talk is about money being spent: the background is a field of isotherms that turns to embers when the bill goes up and to blue once it has been cut. The room feels it without being told.

Then choose one or two highlight moments, no more, for the numbers the room must remember (in the example: 200 points that become a wall of 14,673). Everything else stays restrained.

Division of labor: whatever must be **read** (text, diagram, chart) is done in HTML and SVG, sharp and precise; WebGL is for atmosphere and highlight moments.

### 6. Build

Replace the starter slides part by part. For each visual, first check `references/visual-recipes.md` to see whether it already exists in the example, and copy it with your changes: those visuals have already been cleaned of their defects. `references/engine.md` describes the building blocks (`R`, `Words`, `Num`, `sp`, steps, notes).

Write each slide's speaker notes as you go: that is where everything that doesn't fit on screen lives.

### 7. Check up close

Don't deliver anything you haven't looked at full size. A deck's defects are a few pixels wide (a clipped last letter, a dot that drifts off its path) and vanish in a scaled-down screenshot; the person will see them on a ten-foot screen.

```bash
pnpm screenshots
```

produces a 1920×1080 image per slide and per step in `screenshots/`. Look at all of them, then:

- do it again in a wide and a tall format (`node tools/browser.mjs screenshots --steps final --size 2560x1080`, then `1280x800`): the background must fill the window, the content must stay centered;
- for a synchronized animation (one object following another), measure it with `node tools/browser.mjs measure` instead of judging by eye;
- check the alignment on every slide: when several texts share an edge (a giant number and its caption, a title and its sentence), their edges must land on the same pixel column, within 2 or 3 px, whatever their size. Measure it on the full-size screenshot (first lit pixel column of each block) rather than by eye;
- go through the list in `references/pitfalls.md`;
- finish with `pnpm build`, which must pass without errors.

### 8. Deliver

Say how to launch the deck (`pnpm start`, then `F` for fullscreen and `P` for the presenter view), what you decided on the person's behalf, what has been checked and what hasn't (real projector, remote). Update the deck's `README.md`: sources and dates of the figures.

## Text rules, in short

They come from precise feedback on projected decks; the details and sizes are in `references/style-rules.md`.

- Few words, very large. One idea per slide. Details go in the notes.
- No small text above a title (no kicker, no part number, no "Step 2/5").
- A title names its subject plainly. No narrative hook like "Monday, 7 a.m.", no line that strains for effect.
- Every number has its source at the bottom of the slide. A worked example is labeled as such, with its assumptions.
- An effect that gets in the way of reading is removed, however beautiful.

## When the person comes back with feedback

They watch the deck fullscreen and point out details. For each one: reproduce it at full size, fix the cause (often described in `references/pitfalls.md`) and not just the reported instance, then check the neighboring slides that use the same building block. If an effect feels "weird" to them, it is usually because it isn't synchronized with what it accompanies: time it properly or remove it.
