---
name: ship
description: Ship committed work to the live site. TRIGGER WHEN the user asks to push, ship, deploy or publish anything that moves main. Never run raw `git push` (the pre-push hook blocks it); run `rake ship`.
---

Shipping is **`rake ship`**. Raw `git push` to main is blocked by `.githooks/pre-push` and denied in
Claude's permissions. Pushing to main deploys, so confirm with the user first, as for any push.

## What it does (scripts/ship.mjs)

1. Requires `main`. **Uncommitted changes are never shipped**: commit first.
2. Fetches and rebases onto `origin/main`. Nothing ahead means nothing to ship.
3. Checks HEAD out into a throwaway detached worktree in `/tmp`, then installs, builds and runs the full
   suite there on port **4331**. The dev server on 4321 is neither reused nor disturbed, so a green run
   is against this commit, not whatever happens to be on 4321.
4. Green: pushes that exact commit. If main moved meanwhile, it rebases only over traffic-report
   commits (`reports/`); anything else, or commits you made during the run, stops it. Re-run.
5. Red: nothing is pushed; the worktree is kept and its path printed.
6. Waits for the "Deploy to GitHub Pages" run **for the shipped SHA** and exits with its result.

`DRY=1 rake ship` runs the test pass without pushing.

## Running it

It takes a few minutes: run it with `run_in_background`, then report the outcome. Never `--no-verify`.
After it succeeds, verify against the live site: fetch the page and check the thing that changed.
