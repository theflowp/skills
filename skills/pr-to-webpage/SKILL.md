---
name: pr-to-webpage
description: Turn a GitHub pull request into a clean, self-contained HTML page that explains the changes in plain language for non-technical stakeholders (PMs, leadership, clients, demos). No raw code or diffs, just what changed, why it matters, and what to watch. Use when the user asks to explain a PR as a webpage, turn a PR (URL or number) into a page, make an HTML or plain-language summary of a PR, or share a PR with non-developers. Not a code review.
---

# PR → Webpage (plain-language stakeholder summary)

Transform a GitHub pull request into a **single self-contained HTML file** that a non-technical reader can open and immediately understand: what is changing, why it matters, who it affects, and what to keep an eye on.

This is **not** a code review and **not** a diff viewer. The output contains **no code and no diff hunks**, only clear prose organized into scannable cards. The reader should never need to know what TypeScript or a migration is.

## When to run

- The user gives a PR URL (`https://github.com/<owner>/<repo>/pull/<number>`).
- The user gives a PR number (`#1234` or plain `1234`).
- The user says "explain this PR as a page" without an argument → assume the current branch's open PR (resolve with `gh pr view`).

If no PR can be resolved, **stop and ask** which PR. Do not summarize the local working tree instead.

## Required tooling

- `gh` (GitHub CLI) for every GitHub API call. Never scrape the web UI. If `gh` is not authenticated, run `gh auth status`, surface the error, and stop.
- `git`, file reading and search tools, and a search subagent if available, for codebase context.
- The repo's own map of itself, if it has one (`README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/`): use it to translate "which folder or package changed" into "which part of the product changed" (e.g. `apps/web` → "the web app users see", `services/billing` → "the billing service"). If there is no map, infer it from folder names and code, and stay modest about it.

## Pipeline

### Step 1: Resolve the PR

```bash
# If the user gave a URL or number
gh pr view <number-or-url> --json number,title,body,author,state,isDraft,headRefName,baseRefName,url,mergeable,labels,changedFiles,additions,deletions,createdAt
# If no argument, resolve from the current branch
gh pr view --json number,title,body,author,state,isDraft,headRefName,baseRefName,url,changedFiles,additions,deletions,createdAt
# Checks status
gh pr checks <number>
```

Capture `number`, `title`, `body`, `author.login`, `state`, `isDraft`, `headRefName`, `baseRefName`, `url`, `mergeable`, checks status, `labels`, `changedFiles`, `additions`, `deletions`, `createdAt`.

Print a one-line confirmation header so the user knows the right PR is in scope:

```
PR #<number> · <title> · @<author> · <head> → <base> · checks: <status>
```

If `state != "OPEN"`, note it (merged or closed) but proceed.

### Step 2: Gather the substance

```bash
gh pr diff <number>                                                  # full diff, for YOUR understanding only, never shown
gh pr view <number> --json files -q '.files[]'                       # per-file additions/deletions
gh pr view <number> --json commits -q '.commits[].messageHeadline'   # commit messages (a good source of intent)
```

Read the **entire** diff to understand it, but remember the output shows none of it. Bucket changed files by area of the product. The PR description and commit messages are the author's stated intent: treat them as helpful context, not gospel. If the code clearly does something the description omits, summarize what the code actually does.

### Step 3: Translate to plain language

This is the core of the skill. For every meaningful change, answer the three questions a non-technical reader cares about:

1. **What is it?** A short, jargon-free title ("Faster dashboard loading", not "Add index on `orders.created_at`").
2. **What does it do, and why does it matter?** One to three sentences in plain English, framed around user or business value, not implementation.
3. **What type of change is it?** Classify each into one of:
   - 🟢 **New feature**: something users can now do that they couldn't before
   - 🔵 **Improvement**: an existing thing made better, faster or clearer
   - 🟠 **Bug fix**: something broken now works
   - ⚙️ **Behind the scenes**: infrastructure, refactor or cleanup with no visible user change
   - 🛠️ **Maintenance**: dependency bumps, config, tooling

Group related file changes into ONE card when they serve a single purpose. Aim for **3 to 8 cards in total**, not one per file. Fold purely mechanical changes (lint, formatting, renames) into a single "Behind the scenes" or "Maintenance" card.

Translate technical risk into plain terms:

- A database migration → "This update changes how data is stored, so it needs a quick database update when it goes live."
- A change to shared code used by several parts of the product → "Touches shared building blocks, so several parts of the product are affected. Worth extra testing."
- Failing checks → "Automated checks are currently failing, so this isn't ready to ship yet."
- A new environment variable or config value → "Needs a configuration value set before it goes live."

### Step 4: Build the HTML

Read `assets/template.html` as the structural and visual reference. Produce a **single self-contained `.html` file**: all CSS inline in `<style>`, no external fonts, CDNs or JS dependencies. A tiny inline script is fine for an optional details toggle, but the page must be fully readable with JS disabled.

Required sections, in order:

1. **Header**: PR title, `#<number>` linking to `url`, author, `head → base`, state and checks badges, date.
2. **In a nutshell**: a 2–4 sentence plain-language summary of the whole PR. The one thing a busy reader should take away.
3. **What's changing**: the cards from step 3. Each card: type badge, plain title, 1–3 sentence explanation.
4. **Impact at a glance**: who or what is affected. Will users notice anything? Which part of the product? Any visible behavior change?
5. **Things to keep in mind**: risks, deployment notes, migrations, failing checks, config needs, all in plain language. Omit the section entirely if there is genuinely nothing.
6. **By the numbers**: files changed, lines added and removed, commit count, and where it deploys if the repo documents which branch goes where (e.g. `main` → production). Drop the deploy tile if that isn't documented rather than guessing.
7. *(Optional)* **Glossary**: only if a couple of unavoidable terms slipped through, one line each.

Style rules: clean, light, card-based, system font stack, generous whitespace, color only for the type badges and status. It must look good printed to PDF and opened on a phone. Do not invent metrics or claims the diff and description don't support.

### Step 5: Save and report

Save to **`tasks/pr-<number>-summary.html`** in the repo, creating `tasks/` if needed, and make sure the file is never committed: if `tasks/` isn't already ignored (`git check-ignore tasks/x.html`), add it to `.git/info/exclude` (local, untracked) rather than editing the project's `.gitignore`. Use another location only if the user asks for one. Then:

- Give the user the file path as a clickable link.
- Give a 2–3 line recap of what the page covers.
- Offer to open it (`open <file>` on macOS, `xdg-open <file>` on Linux).

## Guardrails

- **No code, no diffs, no file-path soup** in the output. If a reader needs the diff, they open the PR. Translate, don't transcribe.
- **Don't hallucinate impact.** Every claim on the page must trace back to the diff, the description or the commits. When the purpose of a change is genuinely unclear, say so plainly ("internal change; user-facing impact not obvious from the PR") rather than inventing a benefit.
- **Self-contained only.** No external network requests in the HTML.
- This skill produces a communication artifact, not an approval. It never says a PR is "safe to merge": that is a code review's job.
