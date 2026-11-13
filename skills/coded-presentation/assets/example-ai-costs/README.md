# Example: "AI in production: what it really costs"

The complete deck from a talk given to a room of developers in November 2026: 27 slides, 20 to 25 minutes. The template comes from it, and it is the skill's library of visuals.

This folder only holds what is specific to this talk; the engine is the template's.

| File | Contents |
|---|---|
| `src/slides/intro.tsx` | Title, outline, part-opener slide |
| `src/slides/part1.tsx` to `part4.tsx` | The four parts, the closing, the club badge |
| `src/data/pricing.ts` | Every number, its sources, the worked example |
| `src/styles/slides.css` | The layout of each slide |

## See it run

```bash
bash ../../scripts/new-deck.sh <a-folder> --example
```

then, in that folder, `pnpm install` and `pnpm dev`.

## Use it

`references/visual-recipes.md` says which visual answers which need and where its code lives. Copy the component and its section of `slides.css`, then replace the data.

What it illustrates beyond the visuals:

- **the talk's visual idea**: the background temperature follows the spending (see each slide's `stage: (s) => sp(…)`);
- **speaker notes** split with "STEP n: ";
- **an honest worked example**: assumptions in `EXAMPLE`, the calculation in code, the assumptions shown at the bottom of the slide;
- **an anonymized client case**: no name, no proprietary method, a generic situation.

The figures date from November 11, 2026 and are only there as an example.
