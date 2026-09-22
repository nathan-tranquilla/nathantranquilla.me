---
layout: ../../layouts/Blog.astro
title: "It's Not My Code, It's AI's Code"
author: Nathan Tranquilla
date: "2026/09/22"
tags: ["AI", "Coding"]
draft: true
---

You submitted AI written code as part of a pull request. It doesn't work. Whose responsibility is it
to make sure it's correct? You don't blame the agent that wrote it for you. It's tempting to think
that if you had written it yourself, this is a mistake you would not have made. But are we so
assured in the quality of our handwritten code that being handwritten makes it special? The
certification of our code never lay in our ability to write it by hand. It lies in the ability to
prove that it's correct.

### Three Ways To Write Code With AI

There are several strategies for writing code with AI, and which one you use depends on how far
along the curve you are.

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

### Intent-Driven Development

As people lean further and further toward speed and productivity, a shift in thinking is required.
It seems inevitable that AI will do more and more of the coding. The question is how we do that in a
way where developers still feel they can take responsibility for the code that has been written.

What I would like to propose is intent-driven development. It is a process that lets you take full
ownership of the code that gets written, even when it was written almost entirely inside a black
box.

This is the whole point. What you certify is the intent. The tests are the proof that the code
satisfies it, and that is why you can take responsibility for code you did not write and did not
read.

Tests are important, but they are even more important in the age of AI.

So here is the process. What you want to accomplish, your goal or your ticket, is front loaded into
the AI's context. In practice it looks like having a long conversation with the agent about what you
are hoping to achieve. It may require deep, AI assisted research into areas you do not yet
understand. All of that is part of capturing the intent.

Once sufficient context has been gathered, what matters is that the intent of what you are looking
to accomplish is correctly understood by the agent. In my own development process this is a gating
phase. The agent and I have to agree on the intent. I use a key phrase for it: capture my intent. At
that point the agent does some light research into the work I want to do. Once this phase is
approved, we move on to the next one.

The next phase is planning, and it is also a gating phase. This is where the deep research happens.
The agent does thorough research to produce a plan that details ninety percent of what needs to be
done. Corrections to misunderstandings often surface here as a result of the planning. This phase
also requires that we agree before anything moves forward.

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
task can be completed trivially, in cycles.

There is still a great deal of skill in this. The reality of a software job has always been about
thirty percent thinking and seventy percent friction in writing the code. In this new process we
have not abandoned the thinking. Software developers are still needed. They are still the ones who
translate the nuances of a requirement into what the code should mean.

### Onboarding Your Agent

As you review during the intent driven development process, you may discover that there are
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
general to mock a certain object, but in your project mocking is forbidden and must happen at a
different level. Perhaps an agent's gut instinct is to mock at the component level, and your
convention is that mocking happens deeper, at the REST API layer or the service worker. It is your
responsibility to steer it away from that, with a rule for that test path.

This is a process which improves over time. As it is improved by adding skills and by adding rules,
the autonomy of your agent increases.

### Closing The Type Holes

There is another kind of enforcement worth investing in, and it is programmatic. You may have to
increase the type strictness of your application to close the runtime holes an agent writes into it.
If you have seen a pattern of your agent writing incomplete switch statements, turn it on in your
TypeScript settings. Asking the agent politely will not hold.

It is worth being specific about what strictness means here, because the defaults leave real holes.
Unchecked index access is the clearest one. By default, reaching into an array hands you back the
element type even when nothing is there, so the agent writes code that type checks and then fails at
runtime. Strict null checks close the same kind of gap between a value being absent and a value
being empty. Switch exhaustiveness means the compiler tells you when a new case has been added and a
branch has not been handled.

Each of these is a hole an agent can write straight through. The code compiles. It still breaks in
production.

And when rules are not enough, you can enforce restricted syntax through ESLint. If you keep date
utilities in their own folder, a lint rule is what stops them being hand rolled over and over again
across your project.

### The Cascade

So how do you take responsibility over AI generated code? Through a cascade.

You do it with ESLint rules, and by increasing the type safety of your project so that it is not
possible for an agent to write code that will fail at runtime. You do it by adding skills, which
teach the agent how to carry out the specific, unconventional tasks your project requires. You do it
by adding rules, so that parts of the codebase adhere to conventions that a linter or a TypeScript
setting cannot enforce.

And finally, at the core, you do it by certifying the intent. Once the intent and the scope have
been agreed upon, it is trivial for an agent to write tests and satisfy them. That is how you take
responsibility over AI written code.
