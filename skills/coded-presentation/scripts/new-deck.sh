#!/usr/bin/env bash
# Creates a new deck from the template.
#
#   new-deck.sh <folder>             the template, with its starter slides
#   new-deck.sh <folder> --example   the complete example deck, to see it run
#
# The folder may already hold reference files; it must not hold a project.
set -euo pipefail

DEST=""
MODE=""
for arg in "$@"; do
  case "$arg" in
    --example) MODE="--example" ;;
    -*) echo "Unknown option: $arg" >&2; exit 1 ;;
    *) DEST="$arg" ;;
  esac
done

if [ -z "$DEST" ]; then
  sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -e "$DEST/package.json" ] || [ -e "$DEST/src" ]; then
  echo "There is already a project in $DEST (package.json or src/). Pick another folder." >&2
  exit 1
fi

mkdir -p "$DEST"
cp -R "$SKILL_DIR/assets/template/." "$DEST/"

if [ "$MODE" = "--example" ]; then
  rm -f "$DEST"/src/slides/opening.tsx "$DEST"/src/slides/part1.tsx "$DEST"/src/slides/part2.tsx \
        "$DEST"/src/slides/closing.tsx "$DEST"/src/slides/index.ts "$DEST"/src/data/figures.ts
  cp -R "$SKILL_DIR/assets/example-ai-costs/src/." "$DEST/src/"
  echo "Example deck (AI costs) copied to $DEST"
else
  echo "Template copied to $DEST"
fi

cat <<MSG

Next, in that folder:
  pnpm install        (or npm install)
  pnpm dev            the deck at http://localhost:5180, reloaded on every change
  pnpm screenshots    one full-size image per slide and per step, in screenshots/
MSG
