---
layout: ../../layouts/Blog.astro
title: TypeScript Has A Big Problem
author: Nathan Tranquilla
date: "2026/02/15"
tags: ["Next-Gen Web Dev", "AI"]
---

TypeScript has a big problem. In the age of AI, the cost of writing software is collapsing as AI writes more and more code. But that means the bottleneck has shifted. It's no longer about how fast you can write code. It's about how fast your code compiles and how reliable your type system is at preventing bugs in production. In this post, I'll show you why TypeScript's core design makes both of those harder than they need to be, and we'll explore an alternative.

### The AI Explosion

First, let's discuss the elephant in the room. If you've been using AI at all in the last few months, you've probably noticed an explosion in its ability to write software at an incredible pace. In my personal experience, I don't think it's an exaggeration to say that AI has been a 10x multiplier for me. Just a few months ago, I had to hand-hold AI to develop features slowly and iteratively, which was still an acceleration, but now I can provide a plan for a new feature and it will complete the task in minutes. What used to be the most time-consuming part of development now occupies the least amount of time in the software development lifecycle. The bottleneck has shifted from development to delivery and feedback loops. It's becoming increasingly important to have AI write correct code that doesn't crash in production. This is where TypeScript has a problem.

### TypeScript's Problems

The first problem is that TypeScript's type checker is slow, and the speed is partly dependent on the configuration you're using. You might be asking, "slow compared to what?". I'll get to that later. But this means the compiler can gate the speed of AI in development and extend the feedback loop from development to production.

Secondly, with over 100 compiler settings, even the subset of settings that affect type safety alone produce millions of possible combinations, although in practice there are likely only a few dozen common configurations. This means there isn't just one version of TypeScript. There are dozens that AI has to master and get just right.

Thirdly, TypeScript isn't sound, by design. TypeScript's gradual adoption strategy is to increase the level of typing in your code incrementally. But with TypeScript's many type holes, such as the `any` type and non-exhaustive switch statements, AI can write code that compiles successfully but still produces runtime errors in production.

For example, the `any` type silently disables type checking:

```typescript
const data: any = "hello";
const result: number = data; // compiles, crashes at runtime
console.log(result.toFixed(2)); // TypeError
```

And switch statements don't require exhaustiveness by default:

```typescript
type Status = "active" | "inactive" | "pending";

function handleStatus(status: Status): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    // "pending" is missing — compiles fine, returns undefined
  }
}
```

### Enter ReScript

In the age of AI, web development needs languages with strong type systems that are web-ready, that integrate well with the existing JavaScript ecosystem, and that build fast, both during development and in CI. I want to propose to you that ReScript is that language.

First, ReScript's build system is 6x faster in development and 3x faster in CI today. If you don't believe me, check out my post [Real-World ReScript vs. TypeScript Benchmarks](https://forum.rescript-lang.org/t/real-world-rescript-vs-typescript-build-performance-complete-dinero-js-core-rewrite/7082). It's worth noting that the TypeScript compiler is being rewritten in Go, at which point the performance gap should close significantly.

Second, there is only one level of strictness in ReScript: maximum. You don't configure how safe you want to be. Having worked with ReScript for the past year, I can tell you that AI is now proficient at even the most recent version, version 12. In fact, the ReScript documentation has a section dedicated to LLMs to ensure that AI knows how to use the most recent version of its API.

Third, ReScript is completely sound. Within ReScript code, there are no null or undefined errors. The type system forces you to handle every case explicitly, which means you won't have null- or undefined-related problems originating from your ReScript code in production.

```javascript
let findUser = (id: string): option<string> =>
  if id == "123" {
    Some("Nathan")
  } else {
    None
  }

let greet = (id: string) =>
  switch findUser(id) {
  | Some(name) => `Hello ${name}!`
  | None => "User not found"
  }
```

Control flows in ReScript are truly exhaustive. Compare that to TypeScript, where the switch statement can be written incorrectly in a variety of ways: missing cases, fallthrough without break, and depends on the developer manually adding an exhaustiveness check that TypeScript doesn't provide by default.

In ReScript, the compiler won't let you forget a case:

```javascript
type status = Active | Inactive | Pending

let handleStatus = (status: status) =>
  switch status {
  | Active => "Active"
  | Inactive => "Inactive"
  // won't compile — "Pending" is not matched
  }
``` 

While TypeScript's adoption strategy is to increase the level of typing in your codebase gradually, ReScript's adoption strategy is to increase gradually in presence within your codebase, so that type safety is never compromised. The friction point with ReScript is the interop bindings with existing JavaScript libraries, though I have found that AI is extremely good at writing these bindings for you.

### Conclusion

In the age of AI, TypeScript's problems are solvable with ReScript. The bottleneck today has shifted towards delivery and feedback loops. ReScript addresses both by having an extremely fast build system and providing a completely sound type system that eliminates an entire class of runtime errors before code is ever delivered. If you'd like to know more about ReScript, check out my post [So It Begins... The End Of TypeScript's Dominance](/blogs/so-it-begins-the-end-of-typescript).
