---
layout: ../../layouts/Blog.astro
title: So It Begins... The End Of TypeScript's Dominance
author: Nathan Tranquilla
date: "2025/12/02"
tags: ["Next-Gen Web Dev"]
---

So it begins... TypeScript has been dominant in the web development space, filling an important gap
in the safety and maintainability of front-end applications. But a new challenger is here that 
outperforms TypeScript, and will change the way you develop front-end. I have been a 
web-developer for 14 years, and I've dedicated the last year to researching new web-dev
technologies. This new challenger has the best of both JavaScript and TypeScript, plus a lot more.
In this video, I tell what this challenger is and, more importantly, why it's a game-changer for the
front-end. I will show you how it outperforms TypeScript at enabling developers to write
simpler, more maintainable code, with greater speed and confidence.

But first, are there signals that TypeScript is losing its dominance? Recent industry signals 
suggest growing frustration with TypeScript's limitations. High-profile projects like Svelte 
have cited tooling friction, while companies like Basecamp have pointed to ergonomic issues 
that force developers into complex workarounds. This leaves room to discuss alternatives.

Before we discuss our challenger, let's talk first about how TypeScript's design. This will help
us understand it's deficiencies and why it's challenger is a game-changer.  

### Gradual Adoption
TypeScript is described as _gradually-typed_. It's a superset of JavaScript that comes with settings
that allow for its adoption with varying degrees of typing. This was a game-changer for JavaScript,
as TypeScript could be applied on top of existing JavaScript codebases to provide types at compile
time. Unfortunately, TypeScript's approach towards adoption has made the experience of type 
safety different for each codebase, creating an inconsistent experience from project to project. 
Developers can carry assumptions about how TypeScript "works" from one project to another, which is
dangerous, since type systems are meant to eliminate assumptions about how code works.

This means TypeScript is _unsound_; this is how TypeScript describes itself. This means that 
its type system can't determine if some operations are safe at compile time. That's 
unfortunate, because that is essentially the point of having a type system, to have certainty 
about the soundness of your code before it goes live. TypeScript's gradual nature creates 
several concrete problems in real codebases:

#### Unsafe Array Access

TypeScript has a setting that prevents _some_ but not all unsafe array access 
(`--noUncheckedIndexedAccess`). However, when using a dynamic index to access an array, 
access remains unsafe. Here is an example that is simple to understand; one need only 
imagine that `elements` is a list of users, and `i` is a real index (not randomly 
generated) to see how this becomes problematic. 

```javascript
let i = Math.floor(Math.random() * 10) 
let elements = [1,2,3,4,5] 
console.log(elements[i]) 
```

#### Exhaustive Type-Checking

TypeScript has exhaustive type-checking, with an _asterisk_: you have to have the correct 
compiler options set the in ts config file, and you have to code it correctly for the compiler to
reveal unmatched cases. This involves specifying a `default` case and using the `never` type.
Neither is required for you to TypeScript code that compiles.

Let's use the example from TypeScript's own documentation. Both of these functions compile but are
not
safe against future code changes.

```javascript
type Direction = 'up' | 'down';

const move1 = (direction: Direction) => {
    switch (direction) {
        case 'up':
            console.log('Moving up');
            break;
        default:
            console.log('Moving down');
            break;
    }
};

const move2 = (direction: Direction) => {
    switch (direction) {
        case 'up':
            console.log('Moving up');
            break;
        case 'down':
            console.log('Moving down');
            break;
    }
};
```

If we assume the only two directions will ever be `up` and `down`, then we'll be completely 
surprised one day when we add `right` and `left`. The code will compile, but we'll discover 
it's completely broken at runtime. This is an example where gradual typing and unsoundness overlap
to produce bugs. 

#### Null Safety

TypeScript manages the presence of null or undefined in JavaScript. Due to gradual typing, 
there are many ways in which null can resurface at runtime, depending on your tsconfig settings. 
Whether it's through the use of the `any` type or through assertions such as the non-null 
assertion operator (`!`), the presence of `null` remains a threat that TypeScript has not 
eliminated. 

### The Game-Changer

The top challenger is a new web-dev language! It fixes all of the above problems in
TypeScript, but it also has excellent interoperability with the JavaScript ecosystem, and its syntax
is very similar to JavaScript and TypeScript, making it very easy to learn.

Welcome to ReScript! Some of you may have heard of it, as it has started 
to gain traction recently, but even if you have, there's a very high probability that you 
are unaware of the amazing features of this language. Let's start with familiarity. 

#### Familiar Syntax

ReScript has been designed to look a lot like JavaScript. It accomplishes this through its 
strong type inference, which allows you to annotate the code with as little or as many types as you
like, often leaving code that [resembles
JavaScript](https://rescript-lang.org/docs/manual/overview#comparison-to-js).

#### Interoperability

ReScript not only looks like JavaScript, but compiles to JavaScript in your codebase, which 
provides excellent interoperability with JavaScript. Any package that you use in JavaScript 
can be [imported](https://rescript-lang.org/docs/manual/import-from-export-to-js) into your 
ReScript code. The ReScript source code binds to
[mocha](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/mocha.res)
and Node
[assertions](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/node_assert.res)
for its test suite.  

#### Bindings for React

The core team maintains first-class [bindings](https://rescript-lang.org/docs/react/introduction)
for React and supports JSX. This makes ReScript ready for the web today. When ReScript
compiles to JavaScript, the JSX is preserved so that you can leverage your existing 
toolchain to process your ReScript output just as you would any other JavaScript file. 

ReScript components can be embedded as children or parents of React/TypeScript components. 
This means they fit anywhere in the component hierarchy of your TypeScript/React codebase. 
If you would like to see an example of this, check out [this video](https://youtu.be/wvjN5CIFEdU).

### Ease of Integration

TypeScript's approach to integration (gradual typing) is to adjust the level of typing across the
entire codebase. ReScript's approach is also gradual but in a different way. Instead of adjusting
the level of typing in your entire codebase, you have a new language that is compiled independently of
the rest of your code, with a sound type system that isn't configurable. You gradually add more ReScript
as needed. 

#### Fast Incremental Compilation

ReScript new build system is very fast and outperforms TypeScript for incremental compilation.
ReScript compiles files in isolation, and since the module graph is a strict DAG, features like
parallelization and precise incremental builds are made possible.

#### Sound Type System

ReScript has a completely sound type system. This means we can have certainty about an 
operation's safety at compile-time. This is a stronger guarantee than TypeScript. There is 
no configurability, because its type system is _not gradual_. Thankfully, this means 
ReScript works the same for everyone, so there is a consistent experience from project to 
project. Let's demonstrate ReScript's strengths where TypeScript is weak. 

#### Simplicity

ReScript covers a curated subset of the JavaScript feature set, unlike TypeScript which 
attempts to provide types for all of JavaScript. This makes ReScript simpler with no 
configurability and completely sound. There are generally fewer ways to accomplish the same 
task, the switch statement being a good example, which we will see shortly.

### ReScript Type System Outshines TypeScript

Now let's get into how ReScript fixes the flaws we examined specifically in TypeScript.

#### Null Safety

Null doesn't exist in ReScript; you manage the presence or absence of values through the 
`option` type. TypeScript's strategy is to manage the reality of null in JavaScript 
codebases; ReScript's strategy is to remove null altogether while generating null-safe 
JavaScript code. In short, this means you will never have null-related bugs in your code appear at
runtime.

```javascript
type user = {name: string, email: string}

let findUser = (id: string): option<user> =>
  if id == "123" {
    Some({name: "John", email: "john@example.com"})
  } else {
    None
  }

let displayUser = (id: string) =>
  switch findUser(id) {
  | Some(user) => `Hello ${user.name}!`
  | None => "User not found"
  }
```

#### Exhaustiveness Checking

Exhaustive checking is complete; there's no way to craft a switch statement that 
accidentally causes runtime errors. There are no settings to adjust to make it behave 
differently. It just works.

```javascript
type direction = Up | Down | Left | Right

let move = (direction: direction) =>
  switch direction {
  | Up => "Moving up"
  | Down => "Moving down"
  | Left => "Moving left"
  | Right => "Moving right"
  }
```

#### Safe Array Access

No matter how you access an array element, you have to deal with the option type. It's 
either present or it's not. If you want to access it unsafely, it's glaringly obvious that 
you are doing so, as method names indicate this clearly (e.g., `getUnsafe`).


### Getting Started With ReScript Today!

ReScript presents a serious challenge to TypeScript's dominance. Industry signals show us that
TypeScript is being questioned, which leaves room to explore other options. ReScript is by far the
strongest challenger, offering the safety and reliability that TypeScript promised, but with true
soundness and simplicity. As the web ecosystem continues to demand higher reliability and
performance, ReScript is ready for the web today, providing a clear path forward without sacrificing
the JavaScript feel we know and love. With no opportunities to bikeshed on settings, the experience
from project to project remains the same, simplifying maintenance.

If you want a step-by-step guide on how to get started with ReScript, check out [this
video](https://youtu.be/wvjN5CIFEdU)
to see how to integrate ReScript into your codebase today.