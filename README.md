# Skills

A small collection of [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) I use and found worth sharing. Each skill is a folder with a `SKILL.md` and whatever references, scripts or assets it needs. They work with Claude Code and any agent that reads the `SKILL.md` format.

| Skill | What it does |
|---|---|
| [coded-presentation](skills/coded-presentation) | Builds a keynote-grade presentation as a local Vite + React site instead of a PowerPoint: WebGL shader background, step reveals, counting numbers, presenter view, and a tool that screenshots every slide at full size. Ships a template and a full example deck. |
| [effective-poster](skills/effective-poster) | Designs, audits and redoes posters, flyers and menus that read in 3 seconds and don't look like generic AI output. A 5-criteria grid, the tell-tale signs of an AI poster, a redesign method and image prompts with real graphic rules. |
| [pr-to-webpage](skills/pr-to-webpage) | Turns a GitHub pull request into a self-contained HTML page that explains the changes in plain language for non-technical readers. No code, no diffs. |

## Install

### With the `skills` CLI

Install one skill:

```bash
npx skills add theflowp/skills --skill coded-presentation
```

Or pick from the list interactively:

```bash
npx skills add theflowp/skills
```

### As a Claude Code plugin marketplace

Each skill is its own plugin, so you only install the ones you want. In Claude Code:

```
/plugin install coded-presentation --marketplace theflowp/skills
/plugin install effective-poster --marketplace theflowp/skills
/plugin install pr-to-webpage --marketplace theflowp/skills
```

On older Claude Code versions, add the marketplace first with `/plugin marketplace add theflowp/skills`, then `/plugin install <name>@theflowp-skills`.

### By hand

Copy a skill folder into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project):

```bash
git clone https://github.com/theflowp/skills.git
cp -R skills/skills/effective-poster ~/.claude/skills/
```

## Layout

```
skills/<name>/
├── SKILL.md       # frontmatter (name, description) + instructions
├── references/    # docs the skill loads on demand
├── scripts/       # helper scripts
└── assets/        # templates and files the skill copies
```

## License

[MIT](LICENSE)
