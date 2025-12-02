---
layout: ../../layouts/Blog.astro
title: JavaScript And TypeScript Have Birthed A New Web-Dev Language
author: Nathan Tranquilla
date: "2025/10/29"
tags: ["Next-Gen Web Dev"]
---

JavaScript and TypeScript have birthed a new web development language. This new language fixes the problems of TypeScript while maintaining the feel of JavaScript. First, I will discuss how TypeScript's goal of _gradual adoption_, as this will help us understand the limitations of TypeScript and why they exist. Then I will show how this new language is a huge improvement, providing a completely sound type system. Lastly, I will show you how you can get started today. 

### Gradual Adoption
TypeScript is described as _gradual_. It's a superset of JavaScript that comes with settings that allow for its adoption with varying degrees of typing in JavaScript codebases. This was a game-changer for JavaScript, as TypeScript could be applied on top of existing JavaScript codebases to provide types at compile time. Unfortunately, _gradual_ adoption has made the experience of type safety different for each codebase, creating an inconsistent experience from project to project. Developers can carry assumptions about how TypeScript "works" from one project to another, which is dangerous, since type systems are meant to eliminate assumptions about how code works. 

This means TypeScript is _unsound_; this is how TypeScript describes itself. This means that its type system can't determine if some operations are safe at compile time. That's unfortunate, because that is essentially the point of having a type system—to have certainty about the soundness of your code before it goes live. Let's look at some sources of unsoundness in TypeScript's type system:

### Unsoundness in TypeScript

1. Structural Typing

TypeScript does not distinguish nominally between types. This has been referred to as _duck typing_; "if it walks like a duck and quacks like a duck, it's a duck" as the saying goes. This can lead to all kinds of semantic errors. 

Say you have an object representing `Debt` and another object representing `Credit`. There are no settings in TypeScript that we can apply to solve this problem. 

```typescript
type Debt = {
  userId: string,
  balance: number
}

type Credit = {
  userId: string,
  balance: number
}

function processCredit(credit: Credit) {
  console.log(`User ${credit.userId} has $${credit.balance} available to spend`)
}

// This compiles but is semantically wrong!
let debt: Debt = { userId: "12e3r4", balance: 1234.59 }
processCredit(debt) 
```

2. Unsafe Array Access

TypeScript has a setting that prevents _some_ but not all unsafe array access (`--noUncheckedIndexedAccess`). However, when using a dynamic index to access an array, access remains unsafe. Here is an example that is simple to understand; one need only imagine that `elements` is a list of users, and `i` is a real index (not randomly generated) to see how this becomes problematic. 

```typescript
let i = Math.floor(Math.random() * 10) 
let elements = [1,2,3,4,5] 
console.log(elements[i]) 
```

3. Exhaustive Type-Checking

TypeScript has exhaustive type-checking, with an _asterisk_: you have to have the correct settings and you have to code it correctly for the compiler to reveal unmatched cases. This involves specifying a `default` case and using the `never` type. Neither is required for you to write fully functioning, compiling TypeScript code. 

Let's use the example from their documentation. Both of these functions compile but are not safe to iterate over:

```typescript
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

If we assume the only two directions will ever be `up` and `down`, then we'll be completely surprised one day when we add `right` and `left`. The code will compile, but we'll find it completely broken. This is an example where gradual typing and unsoundness overlap to produce a bug. 

4. Null Safety

TypeScript manages the presence of null or undefined in JavaScript. Due to gradual typing, there are many ways in which null can resurface at runtime, depending on your settings. Whether it's through the use of the `any` type or through assertions such as the non-null assertion operator (`!`), the presence of `null` remains a threat that TypeScript has not eliminated. 

### The Birth of a New Language

There is a new language that is completely sound and as lightweight as JavaScript that solves all of the above problems. It is lightweight because its strong type inference does not require you to annotate your code very much, or at all. It is so syntactically similar to JavaScript that you might forget you're not writing JavaScript. Let me go through some of what makes this language great!

1. Compiles to JavaScript

It compiles to JavaScript in your codebase, which gives it great interop with JavaScript. Interop with TypeScript is easy as well, as you can go so far as to generate TypeScript types from its source code.

2. Null Safety

Null doesn't exist in this language; you manage the presence or absence of values through the `option` type. TypeScript's strategy is to manage the reality of null in JavaScript codebases; this language's strategy is to remove null altogether while generating null-safe JavaScript code. 

```
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

3. Exhaustiveness Checking

Exhaustive checking is complete; there is no way to craft a switch statement that accidentally causes runtime errors. There are no settings to adjust to make it behave differently. It just works.

```
type direction = Up | Down | Left | Right

let move = (direction: direction) =>
  switch direction {
  | Up => "Moving up"
  | Down => "Moving down"
  | Left => "Moving left"
  | Right => "Moving right"
  }
```

4. Safe Array Access

No matter how you access an array element, you have to deal with the option type. It's either present or it's not. If you want to access it unsafely, it is glaringly obvious that you are doing so, as method names indicate it clearly (e.g., `getUnsafe`).


5. Nominal Typing

The problem with structural typing is improved, but not entirely removed. In TypeScript, structural typing is the default. Due to strong type inference, semantic errors can still creep in if types are not explicitly stated. However, this example is a bit exceptional, as the types are collocated in the same file. Normally this is not the case, and the type inference would work perfectly to deduce the correct type. 

```
type debt = {
  userId: string,
  balance: float,
}

type credit = {
  userId: string,
  balance: float,
}

let processCredit = (credit: credit) => {
  Console.log(`User ${credit.userId} has $${credit.balance->Float.toString} available to spend`)
}

// Without the explicit `debt` type, this would still compile 
let debt: debt = {userId: "12e3r4", balance: 1234.59} 
processCredit(debt) // Fails to compile
```

### The Big Reveal

This new language is called ReScript! If you want a step-by-step guide on how to get started with ReScript, check out [this video](https://youtu.be/wvjN5CIFEdU?si=fm2rjhafCMIADXbT) to see how to integrate ReScript into your codebase today.