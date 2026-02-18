---
layout: ../../layouts/Blog.astro
title: "I’m A Web Developer, Here’s Why I DON’T Use TypeScript"
author: Nathan Tranquilla
date: "2026/02/24"
tags: ["TypeScript","Type Safety"]
draft: true
---

I stopped using TypeScript. Not because I don't care about type safety. Actually, it's the opposite. I found something that does it better. In this video I'll show you why TypeScript has been holding me back, and what I replaced it with.

### Strong resistance to TypeScript
	
In 2026, 67.1% of professional developers use TypeScript. This means that one in three developers have resisted the encroachment of TypeScript onto JavaScript’s dynamic nature. This might be understandable if TypeScript was young, but it is now 13 years old, yet there is still strong resistance to its adoption. At this point, I don’t think this is a case of stubborn developers; TypeScript has flaws and this small group isn’t being heard. Let me be their voice for you.

### The type system isn't sound

TypeScript's type system isn’t sound by design. It is meant to be gradually adopted to varying degrees of strictness in your codebase. Depending on the configuration, you can introduce type holes with the `any` type, through `as` casts, or through assertion functions. You can allow unsafe array access without the `noUncheckedIndexedAccess` setting, and even then, there are cases where a dynamic index allows unsafe array access. I get that TypeScript is a compromise, and I understand why, but to some, this is a source of its weakness.

```typescript
type User = { id: number; name: string; email: string };

async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return data as User; // TypeScript trusts you — no validation happens
}

const user = await getUser(1);
console.log(user.email.toUpperCase()); // crashes if API returns unexpected shape
```
<figcaption>TypeScript does not require the API response to be decoded, causing crashes only once the data is used.</figcaption>

```typescript
function processItems(items: string[], indices: number[]) {
  for (const i of indices) {
    const item = items[i]!;
    console.log(item.toUpperCase()); 
  }
}

processItems(["a", "b"], [0, 999]); // runtime error
```
<figcaption>Silencing noUncheckedIndexedAccess with ! trades a compile-time warning for a runtime crash</figcaption>


### Type narrowing is unprincipled
To illustrate what this means, let's look at this example:

```typescript
function process(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase(); // string here
  } else {
    x.toFixed(2); // number here
  }
}
```

In the above example, TypeScript derives a type constraint from a JavaScript runtime pattern and statically analyzes it. Other recognized patterns include:

```javascript
if (x !== null)             ...
if (Array.isArray(x))       ...
if (x !== undefined)        ...
if (typeof x === "string")  ...
```

A disciplined type system would perform type narrowing from a complete set of types amounting to a formal derivation. 


### Which version of TypeScript?

TypeScript has many versions. And I don't mean releases. What I mean is that every configuration of TypeScript compiler changes how TypeScript works. There are hundreds of configuration options, though probably a dozen common ones for projects. This means that TypeScript behaves differently from project to project, each containing its own "gotchas" that developers have to learn.


### Control flow patterns are error-prone
The biggest issue is the switch statement, which can be crafted in a variety of ways that omit cases. Notable issues include `fall-through`, where a missing `break;` causes another case to be processed, and `switch exhaustiveness`, where a missing `never` keyword causes a union member to be missed.

```typescript
type Shape = { kind: "circle" } | { kind: "square" };
function area(s: Shape) {
  switch (s.kind) {
    case "circle": return 1;
    // forgot "square" — no error
  }
}
```
<figcaption>Classic case of missed type union member, a vulnerability as code evolves</figcaption>

```typescript
switch (status) {
  case "pending":
    startTimer(); // falls through to "active" — silent
  case "active":
    render();
}
```
<figcaption>A missed `break;` statement causes both `startTimer()` and `render()` to be invoked</figcaption>


### The type system is immature 
Spend a little time with other languages and you'll notice that their type systems embody patterns such as `Result` and `Option`. In the former, a result can either be `Ok` or `Error`. In the latter, the presence or absence of something is handled with the `Some` or `None`. It's not that the web doesn't contain such concepts, it is that TypeScript is bolted onto JavaScript, and as such, the design is a compromise. 

### TypeScript doesn't attempt to unify the tooling
The JavaScript ecosystem is fragmented, plaguing the ecosystem for far too long. Just try updating the node version of your package, and you'll find that you have to make a bunch of unrelated changes to `eslint` and `babel` just to accomplish the task. These are unnecessary friction points. Other typed languages solve the problem of formatting and bundling as part of their tooling.

### The Alternative
One thing TypeScript has done well is warm developers up to static typing and strongly-typed languages. But I do not believe TypeScript has the features to be the final form in the evolution of web development. There are other web development languages that solve these pain points. Let me make my case for ReScript.

ReScript is a strongly-typed language that compiles to JavaScript. I have heard it said of ReScript that it is what JavaScript would have been had it spent more time in the oven. That's because its type system is sound, and with strong type inference, it has the feel of JavaScript, making it familiar. 

Here are the characteristics that ought to enthrone ReScript as king of web dev languages. 
1. Its type system is sound. There are no null or undefined issues in ReScript, which means the JavaScript it generates is free from null/undefined-related errors.
2. Its strong type inference means you can annotate the code as little or as much as you want, often leaving the feel of having written JavaScript. Familiarity is one of the reasons developers choose their next language, and ReScript is the only language I see that scores high in this area.
3. It is highly interoperable with the JavaScript ecosystem. The main friction point is creating bindings for existing JavaScript libraries. However Claude Code is extremely good at this task. Having worked with ReScript for the past year, I've used ReScript with Astro for SSR and in the client with React no problem. 
4. It is web-ready. ReScript comes with React bindings, compiling to JavaScript with `react/jsx-runtime`, or if desired, with preserved JSX. 
5. ReScript has a great gradual adoption story. TypeScript types the JavaScript that you have; you apply increasing levels of strictness to your codebase. ReScript generates JavaScript so its type system remains sound, while its presence grows in your codebase. 
6. Type-narrowing is principled and accomplished through type algebra, as one would expect of a sound type system.

```javascript
type t = [
  | #bigint
  | #boolean
  | #function
  | #number
  | #object
  | #string
  | #symbol
  | #undefined
]
```
<figcaption>The [possible types](https://rescript-lang.org/docs/manual/api/stdlib/type/#type-t) of JavaScript values. </figcaption>

7. You can't configure the type system. It has one level of strictness (maximum). This means there is only one version of ReScript you have to learn, and it has a language syntax that Claude has already mastered. 
8. ReScript control flows aren't error-prone. Switch statements are truly exhaustive and try/catch blocks allow for narrowing based on the type of error.
9. The type system is more advanced than TypeScript's. Control flow types such as `Result` and `Option` are present as one expects of mature typed languages. This indicates that ReScript patterns are much more developed. 
10. ReScript eliminates the need for `eslint`. JavaScript is ReScript's compiler output; there is no need for linting. ReScript comes with a formatting tool for formatting ReScript code. This eliminates maintenance headaches of typical JavaScript libraries. 

TypeScript has done well to make JavaScript safer, but it's only a step in the evolution of web dev languages. We've become far too attached to it as the pinnacle of web development. At 13 years of age, only 2/3 developers use TypeScript. The resistance from community members should get our attention and cause us to open our eyes and ears to look for alternatives. I've made the case here that ReScript is the next step in the evolution of web dev. 