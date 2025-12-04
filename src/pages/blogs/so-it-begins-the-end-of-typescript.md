---
layout: ../../layouts/Blog.astro
title: So It Begins... The End Of TypeScript
author: Nathan Tranquilla
date: "2025/12/02"
tags: ["Next-Gen Web Dev"]
---

So it begins... For years, TypeScript has been growing in dominance as the standard for 
strong typing in the web development world. I have been in the software development industry 
for 14 years, and ever since its release, TypeScript's position has only become more entrenched. But TypeScript is not without flaws, inviting challenge from new languages with better promise. One language stands above them all, combining the best pieces of both JavaScript and TypeScript with a truly sound type system. In today's video, we're going to examine what this language is and, more importantly, why it's a game-changer for front-end software development, enabling developers to work with greater certainty and confidence in their code, reduce bugs, write simpler code, and unlock the benefits of stable long-term maintenance.

But first, what makes TypeScript so vulnerable to being displaced? To answer that, we'll talk first about how TypeScript is a _gradually-typed_ language and how this compromises the type system. Then we'll be positioned to understand its limitations and why this new language is needed.

### Gradual Adoption
TypeScript is described as _gradually-typed_. It's a superset of JavaScript that comes with settings 
that allow for its adoption with varying degrees of typing in JavaScript codebases. This was 
a game-changer for JavaScript, as TypeScript could be applied on top of existing JavaScript 
codebases to provide types at compile time. Unfortunately, _gradual_ adoption has made the 
experience of type safety different for each codebase, creating an inconsistent experience 
from project to project. Developers can carry assumptions about how TypeScript "works" from 
one project to another, which is dangerous, since type systems are meant to eliminate 
assumptions about how code works. 

This means TypeScript is _unsound_; this is how TypeScript describes itself. This means that 
its type system can't determine if some operations are safe at compile time. That's 
unfortunate, because that is essentially the point of having a type system—to have certainty 
about the soundness of your code before it goes live. TypeScript's gradual nature creates 
several concrete problems in real codebases:

### Unsoundness in TypeScript

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
settings and you have to code it correctly for the compiler to reveal unmatched cases. This 
involves specifying a `default` case and using the `never` type. Neither is required for you 
to write fully functioning, compiling TypeScript code. 

Let's use the example from their documentation. Both of these functions compile but are not 
safe to iterate over:

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
it's completely broken. This is an example where gradual typing and unsoundness overlap to 
produce bugs. 

#### Null Safety

TypeScript manages the presence of null or undefined in JavaScript. Due to gradual typing, 
there are many ways in which null can resurface at runtime, depending on your settings. 
Whether it's through the use of the `any` type or through assertions such as the non-null 
assertion operator (`!`), the presence of `null` remains a threat that TypeScript has not 
eliminated. 

### The Game-Changer

So why is this new language a top contender? For one, it fixes all of the above problems in TypeScript, but it also has excellent interoperability with the JavaScript ecosystem, and its syntax is very similar to JavaScript and TypeScript, making it very easy to learn. 

Welcome to ReScript! Some of you may have heard of it, as it has started 
to gain traction recently, but even if you have, there's a very high probability that you 
are unaware of the amazing features of this language. Let's start with familiarity. 

#### Familiar Syntax

ReScript has been designed to look a lot like JavaScript. It accomplishes this through its 
strong type inference, which allows you to annotate the code as little or as much as you 
like, often leaving code that [resembles JavaScript](https://rescript-lang.org/docs/manual/overview#comparison-to-js).

#### Interoperability

ReScript not only looks like JavaScript, but compiles to JavaScript in your codebase, which 
provides excellent interoperability with JavaScript. Any package that you use in JavaScript 
can be [imported](https://rescript-lang.org/docs/manual/import-from-export-to-js) into your 
ReScript code. The ReScript source code binds to [mocha](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/mocha.res) and Node 
[assertions](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/node_assert.res) 
for its test suite. 

But more importantly, it has bindings for React. 

#### Bindings for React
The core team maintains first-class [bindings](https://rescript-lang.org/docs/react/introduction) for React and supports JSX. This makes ReScript ready for the web today. When ReScript 
compiles to JavaScript, the JSX is preserved so that you can leverage your existing 
toolchain to process your ReScript output just as you would any other JavaScript file. 

ReScript components can be embedded as children or parents of React/TypeScript components. 
This means they fit anywhere in the component hierarchy of your TypeScript/React codebase. 
If you would like to see an example of this, check out [this video](https://youtu.be/wvjN5CIFEdU).

### Ease of Integration
Unlike TypeScript, ReScript is incorporated depth-first in your codebase. This means it's 
not intrusive to introduce. TypeScript is applied across the entire codebase, affecting 
your entire application, making it somewhat intrusive to introduce. Not so with ReScript; 
you can try it out with minimal risk. 

#### Fast Compiler

When demonstrating TypeScript's deficiencies around exhaustiveness checking, we also saw 
that JavaScript allows you to write switch statements in a variety of ways. In ReScript, 
there is one way to write a switch statement. This is intentional, as ReScript is a curated 
subset of JavaScript, which they explicitly correlate with the speed of the compiler. 

#### Sound Type System

ReScript has a completely sound type system. This means we can have certainty about an 
operation's safety at compile-time. This is a stronger guarantee than TypeScript. There is 
no configurability, because its type system is _not gradual_. Thankfully, this means 
ReScript works the same for everyone, so there is a consistent experience from project to 
project. Let's demonstrate ReScript's strengths where TypeScript is weak. 

### ReScript Type System Outshines TypeScript

Now let's get into how ReScript fixes the flaws we examined specifically in TypeScript.

#### Null Safety

Null doesn't exist in ReScript; you manage the presence or absence of values through the 
`option` type. TypeScript's strategy is to manage the reality of null in JavaScript 
codebases; ReScript's strategy is to remove null altogether while generating null-safe 
JavaScript code. 

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

ReScript represents the next evolution in JavaScript development, offering the safety and 
reliability that TypeScript promised, but with true soundness and simplicity. As the web 
ecosystem continues to demand higher reliability and performance, ReScript provides a clear 
path forward without sacrificing the JavaScript feel we know and love. With no opportunities to bikeshed on settings, the experience from project to project remains the same, unlocking the benefits of a stable maintenance cost. 

If you want a step-by-step guide on how to get started with ReScript, check out [this video](https://youtu.be/wvjN5CIFEdU) 
to see how to integrate ReScript into your codebase today.