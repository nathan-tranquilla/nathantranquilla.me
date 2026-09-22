---
name: intent-driven
description: The default working method for this repo — capture Intent first (gate), then Plan (gate) → Tasks → Tests(red) → Code(green) → Verify against Intent, reconciling everything to Intent. TRIGGER WHEN: the user requests a non-trivial feature, change, or decision (anything with a design choice in it).
---

# Intent-Driven Development

The default loop for non-trivial work here. **Intent is the durable, authoritative
artifact**; plan and tasks are disposable scaffolding; tests and code are projections
of the intent. The operating rule that makes it "intent-driven":

> **When anything is wrong or changes, edit the highest-level artifact that's wrong
> and regenerate downstream. Never let the code quietly become the real spec.**

So when behavior is wrong, first ask: was the *code* wrong, or the *intent*? If the
user changes their mind ("drop the tagline", "the mark is too stiff"), edit the
**Intent** first; tests and code reconcile to it. The diff to the Intent is the
record of *why* it changed — the thing that's otherwise invisible.

## The loop

```
Intent (gate) → Plan (gate) → [ Tasks → Tests(red) → Code(green) ] → Verify against Intent
```

A pipeline **with feedback edges**, not a waterfall:
- Tests ↔ Code is the TDD red/green/refactor loop.
- A discovery mid-build that breaks an assumption sends you **back up**: amend the
  Intent, get re-approval, then continue.

## The Intent block

Keep it tiny — six lines, never a doc-dump:

```
# Intent: <feature>
Goal:   <one user-facing sentence — what they can now do>
Why:    <the value / the reason>
Accept: - <observable criterion>   ← each becomes a test
        - <observable criterion>
Non-goals: <explicitly out of scope>
Open:   <decisions you need from the user>
```

State it back to the user and let them red-pen it **before** writing code. That is
the first gate. It catches misunderstandings — placement, framing, scope reversals —
for the cost of six lines instead of a built-and-rejected feature.

**Each `Accept` line becomes a test.** That is the join between this skill and the
test-driven rule in `CLAUDE.md`: the tests are the executable form of the acceptance
criteria, written red before the code exists.

> **"Capture my intent" means PRESENT the Intent block, not just file it.** The whole
> point of capturing intent is for the user to *see that you understood them*. So the
> deliverable of a capture is always the filled-in Intent block **shown back in chat**,
> in this structure — Goal / Why / Accept / Non-goals / Open — so they can red-pen it.
> Writing it only to memory or a doc is **not** a capture; persistence is secondary and
> happens *after* they have seen and confirmed it. Reflect first, file second. A prose
> summary is not a substitute for the structured block — the structure is what makes the
> understanding legible and correctable.

## When to use it, and the escape hatch

- **Use it** for anything with a *decision* in it: a new page, a design or content
  choice, a behavior change, an architectural call.
- **Skip it** for trivial, decision-free changes — a rename, dead code removal, an
  obvious bug fix, a typo. Just do them.

## Where the artifacts live in this repo

| Stage | Durable? | Gate? | Lives in |
|---|---|---|---|
| **Intent** | **Yes** — source of truth | **Yes** | chat, then the commit body when shipped; cross-cutting decisions go to memory |
| **Plan** | No | **Yes** (approach) | inline bullets, or plan mode |
| **Tasks** | No | No | a chat checklist |
| **Tests** | **Yes** | No | `tests/unit/*.spec.ts`, red first |
| **Code** | **Yes** | No | `src/` |
| **Verify** | — | — | re-read the Intent's `Accept` lines and confirm each |

**Only Intent + Tests + Code are load-bearing.** Plan and Tasks are scaffolding, then
disposable. That is the guardrail against bureaucracy: don't write a heavy plan for a
small thing, write the durable Intent, derive the tests, keep the plan to a few bullets.

Note: `/docs` is gitignored, so it cannot hold durable intent. Shipped intent belongs
in the commit body, which travels with the repo. If this repo ever wants the
equivalent of a tracked `design/` folder, that is the place to put it.

## Anti-patterns this prevents

- **Code-as-spec drift** — reconciling to Intent keeps the *why* explicit instead of
  reverse-engineering it from the code later.
- **Build-then-reject** — the Intent gate surfaces disagreement before implementation.
  Five rounds of revision on a one-line tagline is what skipping the gate costs.
- **Lost rationale across sessions** — durable Intent is continuity, which matters
  more here than raw speed.
