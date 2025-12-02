---
layout: ../../layouts/Blog.astro
title: JavaScript And TypeScript Have Birthed A New Web-Dev Language
author: Nathan Tranquilla
date: "2025/10/29"
tags: ["Next-Gen Web Dev"]
---

JavaScri### Getting Started With ReScript Today!

ReScript represents the next evolution in JavaScript development—offering the safety and 
reliability that TypeScript promised, but with true soundness and simplicity. As the web 
ecosystem continues to demand higher reliability and performance, ReScript provides a clear 
path forward without sacrificing the JavaScript feel we know and love.

If you want a step-by-step guide on how to get started with ReScript, check out 
[this video](https://youtu.be/wvjN5CIFEdU?si=fm2rjhafCMIADXbT) to see how to integrate 
ReScript into your codebase today.d TypeScript have birthed a new web development language. This new language 
fixes the problems of TypeScript while maintaining the feel of JavaScript. First, I will 
discuss TypeScript's goal of _gradual adoption_, as this will help us understand the 
limitations of its type system and why they exist. Then I will show how this new language is 
a huge improvement, providing a completely sound type system. Lastly, I will show you how you 
can get started today. 

### Gradual Adoption
TypeScript is described as _gradual_. It's a superset of JavaScript that comes with settings 
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
surprised one day when we add `right` and `left`. The code will compile, but we'll find it 
completely broken. This is an example where gradual typing and unsoundness overlap to 
produce a bug. 

#### Null Safety

TypeScript manages the presence of null or undefined in JavaScript. Due to gradual typing, 
there are many ways in which null can resurface at runtime, depending on your settings. 
Whether it's through the use of the `any` type or through assertions such as the non-null 
assertion operator (`!`), the presence of `null` remains a threat that TypeScript has not 
eliminated. 

### The Birth of a New Language

There is a new language that is completely sound and as lightweight as JavaScript that 
solves all of the above problems. It is lightweight because its strong type inference does 
not require you to annotate your code very much, or at all. It is so syntactically similar 
to JavaScript that you might forget you're not writing JavaScript. This new language is 
ReScript!

#### Familiar Syntax

ReScript has been designed to look a lot like JavaScript. It accomplishes this through its 
strong type inference, which allows you to annotate the code as little or as much as you 
like, often leaving code that [resembles JavaScript](https://rescript-lang.org/docs/manual/overview#comparison-to-js).

#### Interoperability

ReScript not only looks like JavaScript, but compiles to JavaScript in your codebase, which 
gives it great interoperability with JavaScript. Any package that you use in JavaScript can 
be [imported](https://rescript-lang.org/docs/manual/import-from-export-to-js) into your 
ReScript. The ReScript source code binds to [mocha](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/mocha.res) and Node 
[assertions](https://github.com/rescript-lang/rescript/blob/1b3f523b0e2d65b1e37387989e23cc222bb85015/tests/tests/src/node_assert.res) 
for its test suite. But more importantly, it has bindings for React.

#### Bindings for React

The core team maintains first-class [bindings](https://rescript-lang.org/docs/react/introduction) for React, and supports JSX. This makes ReScript ready for the web today. When ReScript 
compiles to JavaScript, the JSX is preserved so that you can leverage your existing 
toolchain to process your ReScript output just as you would any other JavaScript file. 

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

### ReScript outshines TypeScript

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

Exhaustive checking is complete; there is no way to craft a switch statement that 
accidentally causes runtime errors.  There are no settings to adjust to make it behave 
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
either present or it's not. If you want to access it unsafely, it is glaringly obvious that 
you are doing so, as method names indicate it clearly (e.g., `getUnsafe`).


### Getting Started With ReScript Today!

ReScript represents the next evolution in JavaScript development, offering the safety and
reliability that TypeScript promised, but with true soundness and simplicity. As the web 
ecosystem continues to demand higher reliability and performance, ReScript provides a clear 
path forward without sacrificing the JavaScript feel we know and love.

If you want a step-by-step guide on how to get started with ReScript, check out [this video](https://youtu.be/wvjN5CIFEdU?si=fm2rjhafCMIADXbT) 
to see how to integrate ReScript into your codebase today.