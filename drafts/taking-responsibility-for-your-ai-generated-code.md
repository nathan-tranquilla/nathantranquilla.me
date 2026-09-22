---
layout: ../../layouts/Blog.astro
title: Taking Responsibility for Your AI-Generated Code
author: Nathan Tranquilla
date: "2026/09/22"
tags: ["AI", "Coding"]
draft: true
---

AI can increase your speed and productivity, but also decreases your level of visibility into the
code base. How do we manage the correctness of the code when we haven't even written the code
ourselves? I'll go through three common AI usage patterns and show that there's a reasonable path
forward to ensuring correctness while still leveraging AI to its full capabilities.

### Three Ways To Write Code With AI

The first is where most people experimenting with AI start. You offload a small task and you watch
the agent write the code. You still see every line that gets written. What you save is the time you
would have spent clacking away at a keyboard, which is worth something on its own. Your confidence
that you can certify the code stays high, because you supervised the exact blocks that were written.

The second is offloading larger chunks of work. The code the agent writes becomes a little more of a
black box. The process is ad hoc. You carry the bulk of the context in your head, and when you need
something done you offload a small piece of that context to an agent, then carry on coding as
before. Your confidence is lower here, because the larger the task, the less supervision there is
over what gets generated. But the containment is small. The work is scoped to trivial things you
trust the agent to write well.

The third is a shift toward giving the agent all of the context, all of the time. The agent holds
most of the context and writes most of the code itself, from beginning to end, to satisfy the
requirement. This is the most black box of the three, and it is the riskiest. You cannot reasonably
follow or reconstruct all the reasoning the agent used to get there, because doing so would cost you
the very time you were trying to save.

Productivity rises at every step. Visibility falls at every step. That is the problem.

If there are faults in AI-generated code, do you blame AI or do you take responsibility yourself? The
temptation is to blame it on AI, because certainly we wouldn't have written the code poorly if we had
handwritten it. But handwritten code was never proven correct. It was delivered with the confidence
of the developer behind it, and confidence is not proof. Taking responsibility for your code means
being able to prove that it's correct.

### Intent-Driven Development

As people lean further and further toward speed and productivity, a shift in thinking is required.
It seems inevitable that AI will do more and more of the coding. The question is how we do that in a
way where we can prove that the code is correct.

The solution I would like to propose takes the form of a new process called intent-driven
development. It lets you take full ownership of the code that gets written, even when it was written
almost entirely inside a black box.

Here is the whole point. What you certify is the intent. The tests are the proof that the code
satisfies it, and that is why you can take responsibility for code you did not write. Tests have always been important. They are even more important in the age of AI.

So here is the process.

```
Intent (gate) → Plan (gate) → [ Tasks → Tests(red) → Code(green) ] → Verify against Intent
```

It is a pipeline with feedback edges, not a waterfall. Tests and code are the usual red, green,
refactor loop. A discovery mid-build that breaks an assumption sends you back up: amend the intent,
get it approved again, then carry on.

What you want to accomplish, your goal or your ticket, is front-loaded into
the AI's context. In practice it looks like having a long conversation with the agent about what you
are hoping to achieve. It may require deep, AI-assisted research into areas you do not yet
understand. All of that is part of capturing the intent.

Once enough context has been gathered, what matters is that the agent has correctly understood your
intent. In my own development process this is a gating phase. The agent and I have to agree on the intent. I use a key phrase for it: capture my intent. Once this phase is
approved, we move on to the next one.

The next phase is planning, and it is also a gating phase. The agent does thorough research to
produce a plan that details ninety percent of what needs to be done. Corrections to misunderstandings often surface here as a result of the
planning. This phase also requires my approval before anything moves forward.

Once the intent is approved and the plan is approved, the bulk of the code development is handed to
an agent. The agent is instructed to work in cycles. First it writes the tests, runs them, and shows
that they are red. Then it writes the code, runs the tests again, and shows that they are green. It
repeats that cycle until every feature is accomplished to satisfy the intent. The final step is to
verify: the code that has been written is checked back against the original intent.

### Can An Agent Be Trusted To Write Its Own Tests?

Some subtle things have gone on here. Intent-driven development is a process that hands over to the
agent both the test writing and the implementation. The person communicates the deep intent of what
they hope to accomplish. The skill of translating those intents and those plans into tests is left
to the agent itself.

Now you might be questioning how an AI can be trusted to write its own tests. How do you know the
test captures the result correctly? The truth is that we rely heavily on the intent. We rely on a
strong common understanding at the beginning of a task, scoped properly and narrowly enough that the
task can be completed trivially, in cycles of tests and code.

There is still a great deal of skill in this. The reality of a software job has always been about
thirty percent thinking and seventy percent friction in writing the code. In this new process we
have not abandoned the thinking. Software developers are still needed. They are still the ones who
translate the nuances of a requirement into what the code should mean.

### Start With Programmatic Enforcement

Making intent-driven development work in your project is iterative, and it is more nuanced than the
loop suggests. You improve it over time, and the order matters. Start with the basics, which is
programmatic enforcement.

The first thing to invest in is the type strictness of your application, to close the runtime holes
an agent writes into it. If you have seen a pattern of your agent writing incomplete switch
statements, that is something you turn on in your TypeScript settings. Asking the agent politely
will not hold.

Assume `strict` is already on. That is the baseline TypeScript intends, and it buys you a great deal,
including `strictNullChecks`. What matters are the ratchets you can add on top of it, because
`strict` still leaves real holes.

`noUncheckedIndexedAccess` is the clearest one. Without it, reaching into an array hands you back the
element type even when nothing is there, so the agent writes code that type checks and then fails at
runtime. `noFallthroughCasesInSwitch` catches the case that runs into the next one by accident,
which `strict` will not.

Each of these is a hole an agent can write straight through. The code compiles. It still breaks in
production.

The other half of programmatic enforcement is ESLint, where you can restrict syntax outright.
`@typescript-eslint/switch-exhaustiveness-check` covers a gap the compiler leaves. A switch with a
declared return type already errors under `strict` when a case is missing, but a switch that only
does work and returns nothing does not. The lint rule checks the union itself, so it tells you when
a union has gained a member and a branch has not been handled either way. And if you keep date utilities in their own
folder, a lint rule is what stops them being hand rolled over and over again across your project.

These examples are TypeScript, but the principle is not. Retrofitting strictness onto an existing
codebase is the expensive way to get it. If you have the opportunity to start a project, web or
otherwise, where type safety is the priority from the beginning, take it. ReScript is one such
alternative, and it is what I wrote [The Office Lines](https://theofficelines.com) in.

### Onboarding Your Agent

As you review during the intent-driven development process, you may discover that there are
conventions, rules and idiosyncrasies in your project that are not being followed. This is the task
of onboarding your AI to your particular project, and I have written about that
[extensively elsewhere](/blogs/teach-claude-your-project-once-benefit-forever). The answer is
simple, and so is the process.

An agent brings a set of general software development skills with it. What it cannot bring is the
particular quirks of your setup. You onboard it to those through skills and rules.

A skill is something particular to your project that an agent cannot know unless you specify it in
the skill. It gives the agent the tools it needs to do something specific in your project. In fact,
the process of intent-driven development is itself a skill.

Rules hold the conventions of your codebase. These are the things that are not obvious, and that an
agent cannot know unless you tell it. Take your test files. It may be perfectly legitimate in
general to mock a certain object, but if it is your convention to mock at a deeper level, say at the
API level, then this is where a rule comes in. An agent's instinct will be to mock at the component
level, and steering it away from that is your responsibility.

As you add skills and rules, the autonomy of your agent increases.

### The Cascade

So how do you take responsibility for AI-generated code? Through a cascade.

You start with programmatic enforcement. ESLint rules and stricter types close off the preventable
errors, so an agent cannot write them in the first place. Then you add skills, which teach the agent
how to carry out the specific, unconventional tasks your project requires. Then you add rules, so
that parts of the codebase adhere to conventions that a linter or a TypeScript setting cannot
enforce.

And finally, at the core, you do it by certifying the intent. Once the intent and the scope have
been agreed upon, it is trivial for an agent to write tests and satisfy them. That is how you take
responsibility for AI-written code.

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
