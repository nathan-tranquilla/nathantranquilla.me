---
layout: ../../layouts/Blog.astro
title: Taking Responsibility for Your AI-Generated Code
description: "You can own code you never read, if what you certify is the intent. Acceptance criteria you approve become the tests, and the agent picks the assertion but not what counts as correct."
author: Nathan Tranquilla
date: "2026/09/23"
tags: ["AI", "Coding"]
---

AI increases your speed, but it decreases your visibility into the codebase. How do we know the code is correct when we didn't write it? I'll go through three common AI usage patterns and show why only the last one lets you stand behind
your code without giving up the speed.

### Three Ways To Write Code With AI

These three differ by one measure: how much of your context the agent holds. They represent modes of
growing trust between a developer and an agent, because how much you trust it decides how much you
are willing to hand it.

In the first, the agent holds almost no context. You give it the task of creating something small,
like a function, and watch it work. The task is small enough that there is nothing much to explain, and you read every line as it appears. You feel
confident about the code because you witnessed it being written. That is a false sense of
certification. Watching an agent work is pair programming, and pairing has never been the thing
that makes code correct.

In the second, the agent holds fragments of your context. You are handing off more now, but the shape of the work
still lives in your head. You pull the agent in partway through, give it the piece in front of you,
and take the result back. It does not have full insight into the work you are doing. The design is still yours, but
you have stopped reading the code, so even that thin sense of certification is gone.

In the third, the agent begins fully informed. You settle the context with the agent before any code
is written, so you never feed it work in fragments. This is the one worth getting right, and the
rest of this post is about how.

Productivity rises at every step. Visibility falls at every step. Getting AI's full value means
paying that cost, so the question becomes what replaces seeing the code.

If there are faults in AI-generated code, do you blame AI or do you take responsibility yourself? The
temptation is to blame it on AI, because certainly we wouldn't have written the code poorly if we had
handwritten it. Underneath that sits a real belief: when you write the code yourself your reputation
is behind it, and that is what certifies it as correct. But handwritten code was never guaranteed
correct on its own. It needed tests, the same as any other code. Taking responsibility
for your code means being able to show that it works, no matter who typed it.

### Intent-Driven Development

As people lean harder on speed and productivity, a shift in thinking is required. AI is going to do
more of the coding. The question is how to do that and still stand behind the result.

I want to propose a process called intent-driven development. It lets you take full ownership of the code that gets written, even when it was written
almost entirely inside a black box.

It runs in five stages, and two of them are gates you control:

- **Intent.** You converse with the agent about the task. It states your intent back as acceptance
  criteria. Nothing moves until you approve them.
- **Plan.** The agent researches and proposes how the work will be done. This also needs your
  approval.
- **Tests.** Each acceptance criterion becomes a test, written before any implementation exists and
  shown to fail.
- **Code.** The agent writes code until those tests pass.
- **Verify.** You check the result against the intent you approved.

Here is the whole point. What you certify is the intent, and that gets hardened with the plan. Tests
do not prove correctness. But the tests are written from acceptance criteria you set and approved
before any code existed, and the whole process runs test-driven, red before green. The agent writes
the test code. You set the target.
That is why you can take responsibility for code you did not write.

The same thing drawn as a pipeline:

```
Intent (gate) → Plan (gate) → [ Tasks → Tests(red) → Code(green) ] → Verify against Intent
```

It is a pipeline with feedback edges. A discovery mid-build that breaks an assumption sends you
back up: amend the intent, get it approved again, then carry on.

You front-load your goal, or your ticket, into the agent's context. In practice it looks like having a long conversation with the agent about what you
are hoping to achieve. It may require deep, AI-assisted research into areas you do not yet
understand. All of that is part of capturing the intent.

Once you have gathered enough context, the agent states your intent back in six lines:

```
# Intent: <feature>
Goal:   <one user-facing sentence, what they can now do>
Why:    <the value, the reason>
Accept: - <observable criterion>   each becomes a test
        - <observable criterion>
Non-goals: <explicitly out of scope>
Open:   <decisions you need from the user>
```

Filled in, it might look like this:

```
# Intent: empty cart state
Goal:   A shopper with nothing in their cart sees a message instead of a blank total.
Why:    A blank total reads as a bug, and people email support about it.
Accept: - An empty cart renders "Your cart is empty" where the total normally sits.
        - The checkout button is disabled while the cart is empty.
        - A cart with at least one item still shows its total as it does today.
Non-goals: Saved carts. Anything about the cart icon in the header.
Open:   The exact wording of the message.
```

The Accept lines are the ones that matter. They are observable criteria in your words, and each one
becomes a test. The third one is there because I want the existing behaviour pinned down while the
new behaviour goes in. I use a key phrase for this gate: capture my intent. Nothing gets built until I have
red-penned those lines.

Planning is where misunderstandings surface. The agent researches and produces a plan detailing
most of what needs to be done, and the corrections that come out of it are often the most valuable
part of the phase.

With both approved, the bulk of the coding is handed off. Sourcing the tests from the acceptance
criteria, the agent writes them, runs them, and shows that they are red. Then it writes the code,
runs the tests again, and shows that they are green. It repeats that cycle until the intent is
satisfied.

Note where the judgment sits. Every step after your approval is mechanical, which is why your
approval is the part that carries the weight.

### Where The Tests Come From

Intent-driven development hands the agent both the test writing and the implementation. The person communicates the deep intent of what
they hope to accomplish. The skill of translating those intents and those plans into tests is left
to the agent itself.

How do you know the test captures the result correctly? Every test traces back to an Accept line
you wrote and approved. The agent decides how to test it. It does not decide what counts as
correct. Intent is clarified first and hardened through the plan, so by the time a test gets
written the criterion is no longer a goal like "handle empty carts properly." It names a behaviour
and the result that behaviour should produce, which leaves very little room to assert the wrong
thing.

They are also written first, in the test-driven style. The test goes red before any implementation
exists, so it states what the code should do while nobody yet knows how hard that will be.
If the work turns out to be harder than expected, the agent cannot quietly lower the bar, because
the bar is an Accept line you approved and it sits outside the code.

There is still a great deal of skill in this. Most of a software job has always been friction, not
thinking, and friction is the part that gets handed off. The thinking is still yours. You are the
one who decides what a requirement actually means.

### Start With Programmatic Enforcement

You will not get this working in one pass. What the diagram shows is tidier than what the first few
attempts feel like, and you build it up over time. Start with the basics: programmatic enforcement.

The first thing to invest in is the type strictness of your application, so the agent cannot produce
code that compiles and then fails at runtime. If your agent keeps writing incomplete switch statements, turn on the
compiler check that catches them. Asking for it in a prompt is gone by the next session. The check
holds every time.

The other half of programmatic enforcement is ESLint, where you can restrict syntax outright. The
most valuable use of it is convention. Say all of your date handling lives in one module. An agent
has no reason to know that, so it writes its own date math wherever it happens to be working.
Nothing about that code is wrong on its own, which is why no type checker will ever object to it.
You end up with the same logic in three places, drifting apart.

A lint rule can ban date math outside that module and either warn or fail the build. The part that
does the work is the message you attach to the rule, because the agent reads it. Point it at your
helpers and that is where it goes. A convention you would otherwise repeat in every prompt becomes
feedback the agent receives on its own, at the moment it is about to get it wrong.

These examples are drawn from front-end web development. The principle is wider. Retrofitting strictness onto an existing
codebase is the expensive way to get it. If you have the opportunity to start a project, web or
otherwise, where type safety is the priority from the beginning, take it. ReScript is one such
alternative, and it is what I wrote [The Office Lines](https://theofficelines.com) in.

### Onboarding Your Agent

When you check the agent's output against your intent, you will catch conventions it ignored. If
those conventions cannot be enforced programmatically, that is where skills and rules come in. This
is the task of onboarding your AI to your particular project, and I have written about that
[extensively elsewhere](/blogs/teach-claude-your-project-once-benefit-forever).

An agent brings a set of general software development skills with it. What it cannot bring is the
particular quirks of your setup. You onboard it through skills and rules. Writing them
down is what makes them stick.

A skill is a procedure for a task your project does its own way. It loads when that task comes up
and gives the agent the steps. The process of intent-driven development is itself a skill.

Rules hold the conventions of your codebase, and unlike a skill they are not tied to a task. They
apply to everything the agent writes. These are the things that are not obvious, and that an agent
cannot know unless you tell it. Take your test files. It may be perfectly legitimate in
general to mock a certain object, but if it is your convention to mock at a deeper level, say at the
API level, then this is where a rule comes in. An agent's instinct will be to mock at the component
level, and steering it away from that is your responsibility.

As you add skills and rules, the agent needs less from you each time.

### The Cascade

So how do you take responsibility for AI-generated code? Through a cascade.

You start with programmatic enforcement. ESLint rules and stricter types close off the preventable
errors, so an agent cannot write them in the first place. Then you add skills, which teach the agent
how to carry out the specific, unconventional tasks your project requires. Then you add rules, so
that parts of the codebase adhere to conventions that a linter or a TypeScript setting cannot
enforce.

And finally, at the core, you do it by certifying the intent. The tests are generated out of a
hardened plan, and the agent has to satisfy them. Tests cover what the intent named, and a strong
type system and the rest of your programmatic enforcement cover much of what it could not. What is
left over, unnamed by the intent and beyond what types can express, is the residue you still carry.
It is a great deal smaller than what you started with. This is how you take responsibility for
AI-written code.

### Appendix: The Skill File

Since intent-driven development is itself a skill, here is what that file looks like. This is
abridged from the one in this site's repository; the parts I have cut are specific to this project.

```markdown
---
name: intent-driven
description: The default working method for this repo: capture Intent first (gate), then Plan
  (gate) then Tasks, Tests(red), Code(green), then Verify against Intent, reconciling everything
  to Intent. TRIGGER WHEN: the user requests a non-trivial feature, change, or decision.
---

# Intent-Driven Development

Intent is the durable, authoritative artifact; plan and tasks are disposable scaffolding;
tests and code are projections of the intent. The operating rule that makes it
"intent-driven":

> When anything is wrong or changes, edit the highest-level artifact that's wrong and
> regenerate downstream. Never let the code quietly become the real spec.

So when behavior is wrong, first ask: was the code wrong, or the intent? If the user
changes their mind, edit the Intent first; tests and code reconcile to it.

## The loop

Intent (gate) -> Plan (gate) -> [ Tasks -> Tests(red) -> Code(green) ] -> Verify against Intent

## The Intent block

Keep it tiny, six lines, never a doc-dump:

# Intent: <feature>
Goal:   <one user-facing sentence, what they can now do>
Why:    <the value, the reason>
Accept: - <observable criterion>   each becomes a test
        - <observable criterion>
Non-goals: <explicitly out of scope>
Open:   <decisions you need from the user>

State it back to the user and let them red-pen it before writing code. That is the first
gate. It catches misunderstandings for the cost of six lines instead of a built-and-rejected
feature.

Each Accept line becomes a test. That is the join between this skill and test-driven
development: the tests are the executable form of the acceptance criteria.

## When to use it, and the escape hatch

- Use it for anything with a decision in it: a new page, a design or content choice, a
  behavior change, an architectural call.
- Skip it for trivial, decision-free changes: a rename, dead code removal, an obvious bug
  fix, a typo. Just do them.
```

<div class="mt-16 border-t border-[var(--border-primary)] pt-8">
  <p class="mb-6 font-sans text-[var(--text-secondary)]">
    Handing more of your codebase to an agent without losing your grip on it is
    the problem I spend most of my time on. If your team is working through it,
    I take on a small number of engagements.
  </p>
  <a
    href="/consultation"
    class="blog-cta text-nowrap font-mono text-sm uppercase tracking-[0.07em] py-2 px-6 w-fit h-fit cursor-pointer border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[var(--accent-bg)] text-[var(--bg-primary)] border-[var(--border-primary)] hover:bg-[var(--accent-bg-hover)] focus:ring-[var(--accent-bg)] inline-block no-underline"
  >
    Book a consultation
  </a>
</div>
