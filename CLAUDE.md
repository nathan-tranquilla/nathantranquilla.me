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

**Capture Intent first, and gate it, before writing anything.** See
`.claude/skills/intent-driven/SKILL.md` for the full method. In short:

```
Intent (gate) → Plan (gate) → [ Tasks → Tests(red) → Code(green) ] → Verify against Intent
```

Intent is the durable, authoritative artifact. Plan and tasks are disposable
scaffolding. Tests and code are projections of the Intent.

> **When anything is wrong or changes, edit the highest-level artifact that's wrong
> and regenerate downstream. Never let the code quietly become the real spec.**

- **Six lines, stated back for red-penning before any code**: Goal, Why, Accept,
  Non-goals, Open. That gate costs six lines and prevents a built-and-rejected
  feature.
- **Each `Accept` line becomes a test.** This is where the two rules meet: the tests
  are the executable form of the acceptance criteria, written red first.
- **When the user changes their mind, edit the Intent, not just the code.** The diff
  to the Intent is the record of why it changed, which is otherwise invisible.
- **Shipped intent goes in the commit body.** Commit messages travel with the repo;
  chat logs and `/docs` do not.
- **Skip it for decision-free changes** — renames, dead code, obvious bugs.

---

## Gotchas

Things that have already cost time. None are obvious from the code.

**Drafts are not private.** `draft: true` keeps a post out of the `/blogs` listing
and off the homepage, but the file is still a route. Astro generates the page and
the sitemap lists it. Merging a draft to `main` publishes a live, crawlable page.

Unfinished posts therefore live in `/drafts` at the repo root, which is tracked but
is not a route, so a draft can be versioned without being published. Publishing means
moving the file into `src/pages/blogs/`, where its relative `layout:` path resolves.
The repo is public, so a committed draft is readable by anyone browsing GitHub; it is
simply not served on the site or indexed. Anything you would not want read at all
stays untracked.

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
- **Inventory the UI library before building UI.** Before adding or changing any
  markup under `src/` (pages, layouts, components, or HTML inside posts), list
  `src/components/ui/` and state which components apply. Reuse one if it fits;
  if nothing fits, add the new control to the library rather than hand-styling it
  in place. Five hand-rolled buttons drifted apart and two went unreadable in dark
  mode before the library existed. Run `pnpm dev` and open `/ui` to see every
  component and variant.
- **Buttons on dark surfaces use `variant="inverse"`.** The default navy button is
  invisible on the navy footer.
