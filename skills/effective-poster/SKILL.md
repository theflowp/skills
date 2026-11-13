---
name: effective-poster
description: "Designs, audits and redoes posters, flyers, menus and shop visuals that read in 3 seconds and don't look like generic AI-generated posters (ChatGPT, Midjourney…): a 5-criteria grid for an effective poster, the tell-tale signs of an AI poster, a redesign method, and image prompts that carry real graphic rules. Use it whenever the task is to create, critique, improve or generate a poster, flyer, leaflet, restaurant menu, shop window or event visual, even when the user mentions neither AI nor design (\"make me a flyer for my market\", \"what do you think of my poster?\"). Based on Basti Ui's video \"Pourquoi les affiches IA sont aussi moches ?\" (Why are AI posters so ugly?). Triggers: poster, flyer, leaflet, menu, restaurant menu, shop window, event visual, AI poster, AI slop, affiche."
metadata:
  version: "1.1"
  source: "https://www.youtube.com/watch?v=deM5Jhv3714"
---

# Effective poster

A working method distilled from a video by Basti Ui, a French UI designer: "Pourquoi les Affiches IA sont aussi MOCHES ?" (Why are AI posters so UGLY?, https://www.youtube.com/watch?v=deM5Jhv3714). The full argument and the video's examples are summarized in [references/video-summary.md](references/video-summary.md).

## The core idea

A poster is seen for a few seconds, often in passing, among other posters. Its job is to get a message across: **design serves the information, it doesn't steal the show**. A spectacular poster whose message nobody remembers has done nothing.

Posters published straight out of an image generator miss exactly that. Left to themselves, models drift toward what is statistically most likely: a consensual look, neither beautiful nor ugly, standardized. The result is overloaded posters with no hierarchy, and above all posters that all look the same: the identity of the shop, club or brand disappears. A clumsy but handmade poster gets noticed more than yet another "pretty" clone.

This is not about being for or against AI. Using a generator for one element (a background, a texture) and then composing and retouching it yourself is a different thing. The problem is the image published without a human eye on it, and more broadly any poster that fails to communicate. The common thread: put back into what you make something that comes from a real person.

## The 5-criteria grid

Judge any poster, existing or planned, on these five points:

1. **Grab attention** within a few seconds.
2. **Make the subject clear** immediately: what it is about, with no effort.
3. **Rank the information**: an obvious reading order, most important first.
4. **Read fast**: strong contrast, little text, nothing superfluous.
5. **Be distinctive and memorable**: stand out. This one depends on context. On a wall covered in AI posters, the plain or handmade poster is the one you see, and vice versa. Always ask what the poster will be seen next to.

Structure matters more than style. In the video, a poster redone in PowerPoint with Impact and Comic Sans scores better on the grid than the AI-generated original, simply because its information is sorted and ordered.

## Signs of an AI poster

- Overloaded composition: badges, banners, pictograms, textures, ornaments.
- No breathing room, every corner filled.
- Always the same three or four lettering styles, which match no real typeface and change from one word to the next (for example two dates set in two different styles).
- Small decorative dashes on either side of titles.
- A yellow or golden cast, the default "flattering" lighting.
- A pile of good ideas with no shared art direction: watercolor, flat design and 3D in the same image.
- Typos in the text.

Beyond the list, you recognize them by an overall impression: almost human, but something is off (uncanny valley). The public spots them faster and faster, and some reject them openly (protest stickers on posters, AI-redone shopfronts vandalized). For a business, the risk is looking cheap rather than professional.

## Mode 1: audit a poster

If the user provides an image (file path or attachment), open it and actually look at it before judging. If you only have the text or a description, work from that and say what you cannot assess (colors, contrast, size).

1. Run the 3-second test: what do you retain at first glance, and what do you read first? If you can't tell where reading starts, the hierarchy has failed.
2. List every piece of information on it, then rate each criterion of the grid.
3. Note the AI signs actually present, without inventing any.
4. Propose a concrete redesign: what to keep, merge, delete, in what order, with what layout.

Use this format:

```markdown
## Audit: <poster subject>

**In 3 seconds, you retain:** <what really stands out, or "nothing clear">
**What you read first:** <element>

| Criterion | Verdict | Why |
|---|---|---|
| Grabs attention | ✅ / ⚠️ / ❌ | <concrete observation from the poster> |
| Subject clear immediately | | |
| Information ranked | | |
| Reads fast | | |
| Distinctive and memorable | | |

**"AI poster" signs:** <list, or "none">

**Top 3 fixes:**
1. …

**Proposed structure:**
- Title: …
- Visual: …
- Practical info, in this order: …
- Summary badge: …
- Footer: …
- To delete: …
```

Stay factual and kind. Many small business owners use these tools for lack of time or money: the goal is to help them communicate better, not to shame them.

## Mode 2: design or redo a poster

### 1. Frame

Collect these, or infer them from context, without putting the user through an interrogation:

- the concrete goal: fill a room, bring people to the market, sell a dish…;
- where the poster will be seen and next to what: shop window, town notice board, social media…;
- the mandatory information;
- what real material already exists: logo, real photos, brand guidelines, brand typefaces.

### 2. Sort the information

This step pays off the most: a failed poster almost always holds too much information.

- Keep the essentials: what, where, when, plus a price or contact if truly needed.
- Merge the scattered secondary hooks into a single badge or summary line ("market · activities for adults and kids · friendly atmosphere").
- Delete decorative or redundant messages.

### 3. Order

The title (the what) first and biggest, then the practical info in a logical, consistent order, for example place, date, time. Information of the same kind shares the same style.

### 4. Lay out

A structure that almost always works:

- a big title at the top, centered, or left-aligned for a more "designer" look;
- a single visual, ideally a simple real photo (the place, the product, the people) rather than a hybrid illustration;
- a high-contrast block of practical info, possibly boxed;
- the summary badge, if needed;
- the logo in the footer and, if the tone allows, a short friendly note.

Leave room to breathe: empty space is part of the message.

### 5. Typefaces and colors

- One or two typefaces at most. A plain, legible typeface beats an illegible "stylish" one.
- A small palette, strong contrast between text and background, no color mush.
- No gratuitous effects: glows, reflections, fake 3D, textures, ornaments.

### 6. Make the poster distinctive

Distinctive doesn't mean artistic. What sets a poster apart: a real image of the place or product, the business's own identity, a human trace (handwriting, a photo of the team, a tone of voice). The flaws of a handmade poster tell a story: you can guess who made it and the atmosphere you'll find. That is exactly what the generic image erases.

### 7. Deliver

Depending on the need:

- **Printable mockup**: a standalone HTML/CSS file at the poster's format (A4 or A3 portrait, `@page { size: A4; margin: 0 }`), to print to PDF from the browser. Use the real text. For photos, use the user's own; otherwise a clearly labeled placeholder ("real photo of the market") rather than an invented image.
- **Brief for a designer**: goal, where it will be displayed, sorted and ordered information, tone, supplied material.
- **Prompt for an image generator**: see mode 3.

Before delivering, run your proposal through the 5-criteria grid again. If you can render the mockup, also look at it as a thumbnail, as if seen from a distance: the title and the key info must stay legible. Say honestly what could still be improved.

## Mode 3: go through an image generator

If the user insists, don't refuse and don't lecture: help them get better than the default output.

- **Write the graphic rules into the prompt**, otherwise the model falls back on its clichés: type of visual ("real photo of a night market"), title position and alignment ("title top left, left-aligned"), clearly legible factual info, "nothing superfluous: no badges, banners, pictograms, ornaments or textures", a limited palette, large empty areas.
- **Better: generate only the visual and set the text separately** (Canva, PowerPoint, Figma, HTML). Generated text often has typos and inconsistent lettering; setting it yourself guarantees spelling and hierarchy.
- **Proofread any generated text** character by character: dates, prices, numbers.
- **No "in the style of" a creator or brand**, and no third-party visual given as a model to reproduce. That is plagiarism, which can amount to copyright infringement (in France, *contrefaçon*), and brands have already had to pull visuals copied this way. Legitimate references: your own photos, your own brand guidelines, or generic principles ("typographic, understated, lots of white space").
- **Usage rights**: terms vary from one tool to another, and some exclude commercial use. Advise checking the terms of service before printing.
- Warn that even well guided, the image often keeps a slightly artificial feel. A real element (a real photo, handwriting, a logo) remains the best antidote.

## Common cases

- **Food or product photos**: putting the real dish near a window and shooting it with a phone is enough. A generated photo promises a dish the customer won't get, and it shows.
- **Menus**: one clear, ranked menu, not one poster per product or four products crammed per poster.
- **No budget, no time**: a chalkboard and chalk ("Coffee €5"), or an A4 sheet with a real photo taped in the window, communicate better than a generic poster. Imperfect, but clear and recognizable.
- **Large chains**: raw generation erases brand identity, to the point where competing chains' posters become indistinguishable. Bring everything back to the existing brand guidelines.

## If the user pushes back ("AI is free")

A few arguments, to use without insisting:

- **A poster is an investment, not an expense.** €200, or a few hours of your own time, that bring in 10 or 20 more people pay for themselves quickly. A free poster that brings in nobody saved nothing.
- **It's a shop window.** Neglecting it saves time, but nobody walks in. Neglect your image and people will neglect you.
- **The IKEA effect.** We overvalue what we co-created: the image you watched emerge while chatting with ChatGPT feels unique to you, while to passers-by it's one more image, identical to the others.

Worked figures, the study on image convergence and the legal points: [references/video-summary.md](references/video-summary.md).
