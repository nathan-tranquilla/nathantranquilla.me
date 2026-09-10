# nathantranquilla.me

Personal site: essays on software, theology, and books. Astro + Tailwind v4, with a
little ReScript. Deployed to GitHub Pages.

---

## Working agreement

Two rules govern work here. Both are defaults, not suggestions, and both are opted
out of verbally and explicitly in the request itself.

### 1. Test-driven

**Write the failing test first. Every time, unless told otherwise in that message.**

- **Red before green.** The test must fail for the intended reason before the
  implementation exists. If a test was written after the code, break the code and
  watch it fail before trusting it. A test that is green on its first run has proven
  nothing.
- **No size exemption.** "Too small to test" is how this rule dies. A one-line
  helper gets a test.
- **Opt out is verbal and explicit**: "no test", "spike this", "just explore". The
  absence of the word *test* in a request is not an opt-out.
- **Exempt by nature:** one-off analysis scripts, read-only queries, throwaway
  exploration, and pure content or copy edits.

**When a test passes on its first run, suspect it.** Assertions scoped to rendered
output are the usual culprit: a selector that reaches into a neighbouring component,
or a check that would still hold with the feature deleted. Confirm it discriminates
before moving on. Flipping one constant is usually enough.

This applies to styling and configuration too, not just logic. A rewritten component
with a new prop is code. So is a design token change that can silently produce an
invisible button or a font that quietly falls back.

### 2. Intent-driven

**Record why, not just what.** A diff shows what changed. It rarely shows what the
change was protecting against, and that is the part someone needs six months later
in order not to undo it by accident.

- **Commit bodies carry the intent.** What the change is for, what it replaced, and
  what would break if someone reverted it. Commit messages travel with the repo;
  chat logs and local notes do not.
- **Name the decision that isn't visible in the diff.** If a value was chosen over
  an obvious alternative, say which and why. If something was deliberately left
  alone, say so.
- **Don't reverse a decision without finding its intent first.** If the reason isn't
  recorded, ask rather than assume it was arbitrary.
- **Corrections are part of the record.** If a fact turns out to be wrong, write the
  correction down where the wrong version lived, so it can't come back.

---

## Gotchas

Things that have already cost time. None are obvious from the code.

**Drafts are not private.** `draft: true` keeps a post out of the `/blogs` listing
and off the homepage, but the file is still a route. Astro generates the page and
the sitemap lists it. Merging a draft to `main` publishes a live, crawlable page.
To keep a post genuinely unpublished, keep it out of `src/pages/blogs/`.

**Never hardcode root paths for assets under `src/`.** They are hashed into
`/_astro/`, so `https://nathantranquilla.me/logo.png` 404s. Import the asset and
build the URL from its `.src`. Three URLs in the JSON-LD shipped broken this way,
and the specs passed because they only checked the fields were *defined*. Assert
that URLs resolve, not that they exist.

**The test port collides.** `playwright.config.ts` hardcodes `localhost:4321` with
`reuseExistingServer`. If another Astro project is already on 4321, `pnpm test`
either hangs or, worse, runs the suite against the wrong site. Check what is on the
port before trusting a green run.

**Run `pnpm res:build` before testing a fresh clone.** The consultation page uses
`FormTabs.res`; without the compiled output its tests fail for reasons that look
unrelated to the change in hand.

**The dev server goes stale.** Editing `src/layouts/Main.astro` under a running
server can produce "Unable to render Layout because it is undefined" on unrelated
pages. Restart before believing it. A clean `pnpm astro build` is the tiebreaker.

**`/docs` is gitignored.** Working notes and post outlines live there, local-only,
with no backup. New files there are not tracked and will not survive a fresh clone.
One exception, `docs/blog-backlog.md`, is tracked because it predates the ignore
rule, so the folder looks half-versioned. `git check-ignore docs` returns nothing
for the directory itself; check a file inside it instead.

**Scheduled workflows get disabled.** GitHub auto-disables the deploy workflow after
about 60 days of repository inactivity. If nothing has deployed in a while, check
`gh workflow list --all` before debugging the build.

---

## Deploys

- **Trunk-based. Commit to `main`.** No feature branches and no PRs unless
  explicitly asked for.
- **Pushing to `main` deploys.** The workflow triggers on push to `main`, a daily
  6am cron, and manual dispatch. Confirm before pushing anything outward-facing.
- **Match the deploy run by SHA, not by "latest".** Querying for the most recent run
  immediately after a push returns the *previous* commit's run, which is already
  green, and reports a success that has nothing to do with the change just pushed.
- **Verify against the live site, not the workflow status.** Fetch the page and
  check the thing that was supposed to change.
- **The repo is public.** Anything committed is published, including notes.

---

## Design

Named direction: **Swiss Editorial**. Structure from Works in Progress, palette
measured from Asterisk, logo treatment after Stripe Press.

- **Type**, all self-hosted via `@fontsource`. Literata for display, Source Serif 4
  for reading, IBM Plex Mono for navigation, dates, bylines and labels. Spectral is
  reserved for the `nt` mark alone, so the logo is not merely a smaller heading.
- **Palette.** Paper `#faf8f0`, yellow field `#f0eca8` used as one band rather than
  a ground, ink navy `#12233a` for surfaces, `#1a6fa8` for links, `#15161a` for
  hairline rules.
- **Square corners, no shadows.** Tailwind's `--radius-*` and `--shadow-*` scales
  are zeroed in `@theme`, so every `rounded-*` and `shadow-*` utility in the markup
  is deliberately inert. Change it in one place, not per component. `rounded-full`
  is not themeable in v4 and is handled by hand.
- **Mono for chrome, serif for content.** That pairing is the most distinctive thing
  about the design. Keep it.
- **Buttons on dark surfaces need `invert`.** The default navy button is invisible
  on the navy footer.
