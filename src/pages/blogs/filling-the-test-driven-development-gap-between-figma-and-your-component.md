---
layout: ../../layouts/Blog.astro
title: Filling the Test-Driven Development Gap Between Figma and Your Component
description: "Even with the Figma MCP, AI agents build components that are close but not exact. A Claude skill makes their styles testable in Playwright or Vitest."
hash: "po4bik"
author: Nathan Tranquilla
date: "2026/10/07"
tags: ["AI", "Coding", "Automation"]
---

## The Gap

You have Figma MCP access and an agent working in a test-driven workflow. Yet at the end of a UI task, you still fuss for far too long over Figma fidelity. That's frustrating, because test-driven development should carry the whole component through, including how it looks. What is missing? An exhaustive specification of the component, and a way to get one.

Getting the last details to match the Figma is costly. Sometimes I copy styles out of Figma and paste them into the chat, so the agent knows which styles belong to which element. Other times I just look, and notice padding off, margins off, things shifted. The subtle ones are the hardest to catch by eye: a font family or weight that isn't quite right, small differences in padding and margin, alignment. When there are more than a few, finding them becomes a burden out of proportion to the rest of the work.

Gaps like this usually show up only after you've worked in a space a long time, felt the friction yourself, and caught yourself doing the same task over and over. Matching those last details was one of those tasks for me. I began to wonder: surely this is a mechanical, repeatable process that I can write down. That is exactly the kind of friction that should make you think of a Claude skill.

## Why the Pieces Already Exist

When you test in a real browser, with Playwright or Vitest in browser mode, you can read an element's resolved styles. That matters because of the cascade and inheritance. An element can inherit declarations from its parents or have them overridden by other rules, so the style you apply isn't necessarily the style that resolves. That's why access to the resolved styles in a browser is important.

Here is how that plays out on a card title:

```css
/* Inheritance: the title never sets a colour,
   so it takes one from its nearest ancestor that does. */
body {
  color: rgb(55, 65, 81);
}

/* The cascade: two rules match the same title. */
.card-title {
  font-size: 20px;
  font-weight: 600; /* what you wrote */
}

.card h3 {
  font-weight: 500; /* more specific, so it wins */
}

/* Resolved on <h3 class="card-title">:
   font-size:   20px
   font-weight: 500                 (not 600)
   color:       rgb(55, 65, 81)     (inherited, not set) */
```

Figma, on the other hand, is the authoritative source for a component's specification. Reading those values in the UI is trivial: select any layer, and Figma shows all its properties. To get the full specification, though, you have to click through every layer nested inside the frame and copy and paste each one, which is very annoying. Or you can have an agent use the MCP to do it and write out a full spec of every node.

I'm writing from a corporate context, and that shapes my assumptions. My context includes design libraries, which carry much of the style guide within them. The designers working in Figma build with those same libraries. So a button you implement comes with its states and breakpoints already defined by the library. The same goes for Figma properties with no CSS equivalent: the design language, and the libraries built around it, handle those. The process I'm about to describe helps in two places: building out and extending the design library itself, and assembling those components into larger components for applications.

## The Skill: Extract an Exhaustive Spec

This is where a skill comes in. Instead of clicking through each layer and collecting a detailed list of styles yourself, you have the agent gather them and output a full JSON document. The document specifies every element in the component and what its styling is supposed to be. Here is one entry, for a card's title:

```json
{
  "root": "card",
  "nodes": {
    "card.header.title": {
      "figmaName": "Title",
      "type": "TEXT",
      "tokens": { "color": "text/primary" },
      "css": {
        "font-size": "20px",
        "font-weight": "600",
        "line-height": "28px",
        "color": "rgb(17, 24, 39)"
      },
      "unmapped": []
    }
  }
}
```

Figma won't always group layers the way your markup nests elements, and that's fine. The spec is an exploratory map. Its job is to identify everything in the design, not to organize it the way your markup is organized.

Exhaustiveness is the point. Without this skill, an agent does a preliminary, shallow implementation. You need a full specification of every component, every container, every title, every button and its shadow, and so on. With the full specification, you can develop the component's styles in a test-driven fashion. The skill is additive to [intent-driven development](/blogs/taking-responsibility-for-your-ai-generated-code/), where approved acceptance criteria become the tests.

Each spec gives you the acceptance criteria for how something should look. The card title in the spec above has a font size, a font weight, a line height and a colour. Each of those can be written as a test in your Vitest or Playwright suite, checked against the resolved styles. Here are those tests in Playwright:

```ts
import { test, expect } from "@playwright/test";

test("card.header.title", async ({ page }) => {
  await page.goto("/components/card");
  const title = page.getByRole("heading", { name: "Pro plan" });
  await expect(title).toHaveCSS("font-size", "20px");
  await expect(title).toHaveCSS("font-weight", "600");
  await expect(title).toHaveCSS("line-height", "28px");
  await expect(title).toHaveCSS("color", "rgb(17, 24, 39)");
});
```

And the same tests in Vitest browser mode:

```tsx
import { test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { Card } from "./Card";

test("card.header.title", async () => {
  const screen = await render(<Card plan="Pro plan" />);
  const title = screen.getByRole("heading", { name: "Pro plan" });
  await expect.element(title).toHaveStyle({
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "28px",
    color: "rgb(17, 24, 39)",
  });
});
```

## The Last Mile

Many have tried to solve this with screenshots, me included. You have an agent download the Figma frame as a PNG, take a screenshot of the component running in the browser, and compare the two. The results have never satisfied me. The approach never produced the level of detail I need to get a component most of the way there, and my own eye is better at spotting differences than an agent comparing images.

A screenshot also can't tell you where spacing belongs. Say the text has more space on its left than it should. Does the padding go on the container just around the text, or on the parent container? All of that is part of the problem, and a screenshot can't answer it.

In the end, UI work must pass a visual check, a kind of smoke test from the user. That's where the last small share of the effort belongs. You look over the component and make sure it looks good. With fidelity this high, the minor differences that remain are easier to spot.

## Where This Breaks Down

Figma is the default authority, but a Figma file is only as good as the designer who made it. Designers sometimes don't adhere to the design language. That's a real limitation: this approach needs a Figma expert, someone who designs things as they should actually look in the browser. If a designer is going to be exact about padding, for example, they need to put the padding in the right places.

What do you do when one change breaks dozens of assertions? If the component is meaningfully different, just regenerate the specs from Figma. If the component has some minor adjustments, then update the spec. It's really that simple. Figma is always the source of truth, and specs can be trivially regenerated for large overhauls of components.

Of course, you have to size and scope your work properly. That comes from a properly scoped ticket, and out of good engineering practice, where work is broken down to the right size. With well-sized work, you may need one round of exhaustive specification or a few, depending on how much information the component holds and how large the scope is.

## Getting Started

To start, get into a [test-driven development workflow](/blogs/taking-responsibility-for-your-ai-generated-code/). With intent-driven development, the agent is already working from specifications and writing tests red first, then green. The [skill's](/blogs/teach-claude-your-project-once-benefit-forever/) job is to download and store the Figma specification as an artifact. Your existing agent and test-driven process can then pick up the right specification, build the component, and check its resolved styles in a real browser, with Playwright or Vitest in browser mode, to ensure fidelity. A stripped-down version of the skill is in the appendix.

## Appendix: A Starting Skill

```markdown
---
name: figma-exhaustive-spec
description: "Even with the Figma MCP, AI agents build components that are close but not exact. A Claude skill makes their styles testable in Playwright or Vitest."
---

# Figma Exhaustive Spec

Turn one Figma node into a complete spec of how it should look. The output
is the spec only; your test-driven workflow writes the tests from it.

## Rules

- **Exhaustive or flagged.** Every property of every node ends up in the
  spec, or in an `unmapped` list with a reason. Never drop one silently.
- **Resolved values.** Record values in the form the browser resolves
  (`getComputedStyle`), never class names. Resolve design tokens to their
  final values, and keep the token name for traceability.
- **Longhand only.** Record `padding-top`, not `padding`.
- **Fluid sizes are relationships.** Where Figma sizes a layer to fill or
  hug its container, record that relationship (it stretches, or it has no
  fixed size). Record a width or height in `px` only where Figma fixes it.
- **Walk the whole tree.** Do not stop at the top frame.
- **Figma is the default authority.** When a value looks wrong (off the
  spacing scale, a near miss on a token, siblings that should match but
  don't), ask. Never guess, and never quietly change a value to fit.

## Steps

1. **Extract.** Through the Figma MCP, walk the root node and every
   descendant. For each, record layout, sizing, spacing, fills, borders,
   corner radii, effects, opacity and typography.
2. **Name.** Key each node by its layer path, like `card.header.title`,
   not by Figma's internal ID. The path identifies the node; it does not
   need to match how your markup nests.
3. **Normalize.** Convert each value to the form the browser reports:
   `rgb()` colours, `px` lengths, numeric font weights. Figma can give
   line height and letter spacing as percentages; convert them to `px`.
4. **Write the spec.** Save it as JSON, one entry per node, each with its
   own `unmapped` list.
5. **Report.** Nodes walked, properties recorded, and anything unmapped or
   questioned.

Do not use screenshots or pixel diffs.
```

<div class="mt-16 border-t border-[var(--border-primary)] pt-8">
  <p class="mb-6 font-sans text-[var(--text-secondary)]">
    If your team still checks UI against Figma by eye, I can help you close that
    gap. I'm an expert in web development and AI-first development, and I bring
    AI-driven insights to the organizations I work with.
  </p>
  <a href="/consultation" data-ui="button" data-variant="primary">
    Book a consultation
  </a>
</div>
