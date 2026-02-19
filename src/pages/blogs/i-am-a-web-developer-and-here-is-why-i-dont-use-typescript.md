---
layout: ../../layouts/Blog.astro
title: "I’m A Web Developer, Here’s Why I DON’T Use TypeScript"
author: Nathan Tranquilla
date: "2026/02/24"
tags: ["TypeScript","Type Safety"]
draft: true
---

I stopped using TypeScript. Not because I don't care about type safety. Actually, it's the opposite. I found something that does the job better. In this post I explain why I don't use TypeScript, and what I've replaced it with.


### Strong resistance to TypeScript
	
In 2026, [67.1% of professional developers](https://navanathjadhav.medium.com/typescript-vs-javascript-in-2026-when-should-you-actually-use-typescript-95da08708cc6) use TypeScript. This means that one in three developers have resisted the encroachment of TypeScript onto JavaScript’s dynamic nature. This might be understandable if TypeScript were young, but it is now 13 years old, yet there is still strong resistance to its adoption. At this point, I don’t think this is a case of stubborn developers; TypeScript has flaws and this small group isn’t being heard. Let's enumerate the grievances. 

#### 1. The type system isn't sound

TypeScript's type system isn't sound by design — it is meant to be gradually adopted to varying degrees of strictness in your codebase. I get that TypeScript is a compromise, and I understand why, but it also means it has these weaknesses:

1. `as` cast weakening type guarantees

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
    <figcaption>TypeScript trusts the `as` cast without validating the response shape — the crash only surfaces when the data is used.</figcaption>

2. Unsafe indexed access — `noUncheckedIndexedAccess` is off by default and not included in `strict` mode. Matt Pocock of Total TypeScript calls it [the best feature you've never heard of](https://www.totaltypescript.com/tips/make-accessing-objects-safer-by-enabling-nouncheckedindexedaccess-in-tsconfig) (Published in 2023), suggesting it's not often enabled in projects.

    ```typescript
    const myObj: Record<string, string[]> = {};

    myObj.foo.push("bar"); // TypeScript: fine. Runtime: TypeError — myObj.foo is undefined
    ```
    <figcaption>A missing key returns `undefined` at runtime, but TypeScript assumes it exists. Catching this requires enabling `noUncheckedIndexedAccess` — an opt-in, not the default.</figcaption>

3. Type narrowing can be invalidated by a function call. TypeScript narrows a variable's type after a null check, but if a called function mutates that variable, the narrowed type no longer holds. This is because TypeScript performs type narrowing based on JavaScript runtime patterns. This is part of what makes TypeScript feel "bolted on" to JavaScript.
    ```typescript
    let x: string | null = "hello";
    const clear = () => { x = null; };

    if (x !== null) {
      clear();           // x is now null
      x.toUpperCase();   // TypeScript still thinks x is string — crash
    }
    ```
    <figcaption>TypeScript narrows `x` to `string` after the null check, but doesn't account for `clear()` mutating it.</figcaption>


#### 2. Which version of TypeScript?

TypeScript has many versions. And I don't mean releases. What I mean is that every configuration of TypeScript compiler changes how TypeScript works. There are hundreds of configuration options, though probably a dozen common ones for projects. This means that TypeScript behaves differently from project to project, each containing its own "gotchas" that developers have to learn. Here are a few settings that are off by default and considered [too noisy](https://www.totaltypescript.com/tsconfig-cheat-sheet) to turn on:

1. `noUncheckedIndexedAccess`. Changes the return type to `T | undefined`. 
    ```typescript
    const items = ["a", "b", "c"];
    const x = items[99]; // type: string (default) — undefined at runtime
    ```

2. `noImplicitReturns`. This prevents functions from silently returning `undefined` 
    ```typescript
    function getLabel(status: string): string {
      if (status === "active") return "Active";
      // Implicit "undefined" return here.
    }
    getLabel("inactive").toUpperCase(); // TypeError
    ```
3. `noFallthroughCasesInSwitch`. This setting prevents a common `footgun` when writing switch statements. Without it enabled, developers can write switch statements that process multiple case statements unintentionally.
    ```typescript
    switch (status) {
      case "pending":
        startTimer(); // falls through silently
      case "active":
        render();
    }
    ```

These 3 settings affect the type safety and control flow patterns of TypeScript in ways that are very impactful. These three settings alone create 8 distinct "versions" of TypeScript that a developer must master. 

#### 3. Control flow patterns are error-prone
`switch` and `try/catch` both have notable issues.

**`switch`**: can be written with fall-through bugs (missing `break`) and exhaustiveness gaps (missing cases), both of which are silent by default.

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

**`try/catch`**: has no typed errors. There is no support for a `throws` annotation that would help inform TypeScript on the type of error that can be caught.

```typescript
function fetchUser(id: number) {
  // Could throw NetworkError, AuthError, ParseError — TypeScript has no idea
  return fetch(`/api/users/${id}`).then(res => res.json());
}

try {
  const user = await fetchUser(1);
} catch (e) {
  // e is unknown — you must guess what to check for
  if (e instanceof NetworkError) { ... }
  if (e instanceof AuthError) { ... }
  // miss one and it goes unhandled
}
```
<figcaption>TypeScript cannot express what a function may throw. The caller has no way to know what to handle without reading the source.</figcaption>


#### 4. The type system is immature 
TypeScript is missing types that embody common patterns. Let's look at the `result` and `option` types. 

**`result` type**: Computations can either succeed or fail. The `result` type embodies this pattern by allowing the caller to branch on `ok` or `err`. TypeScript has no equivalent — the most accessible pattern for handling errors is `try/catch`, which as we've seen carries no type information about what might be thrown.

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

try {
  const result = divide(10, 0);
} catch (e) {
  // e is unknown — nothing in the type system told you this could throw
}
```
<figcaption>The function signature says nothing about failure. The caller has no way to know a try/catch is needed without reading the implementation.</figcaption>

**`option` type**: used to handle the presence or absence of a value. The `option` type embodies this by allowing you to branch on `some` or `none`. In TypeScript, absence is represented by a union with `null` or `undefined` — ad hoc rather than a principled type.

```typescript
function findUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = findUser(1);

if (user !== undefined) {
  console.log(user.name); // safe
} else {
  console.log("User not found");
}
```
<figcaption>Without an `option` type, the developer must depend on a runtime `undefined` check to branch on the result. There is no type-level construct that enforces handling both cases.</figcaption>

The `Promise` type proves that the concept of the `result` exists in web development, it's just not formalized in TypeScript. 

```typescript
fetch("/api/user")
  .then(res => res.json())  // success branch
  .catch(err => {           // error branch
    console.error(err);
  });
```
<figcaption>`Promise` handles success and failure as first-class branches, much like the `result` type.</figcaption>

#### 5. TypeScript doesn't attempt to unify the tooling
The JavaScript ecosystem is fragmented. Starting a fresh TypeScript project still means managing `tsconfig.json`, `.eslintrc`, `.prettierrc`, and a bundler config, not to mention that eslint and prettier have overlapping concerns. TypeScript solved the type problem and left everything else exactly where it was. Rust ships `rustfmt` and ReScript ships `rescript format`. TypeScript had the opportunity to consolidate tooling and did not. This has left the ecosystem as fragmented as it was before TypeScript arrived.

### The Alternative
One thing TypeScript has done well is warm developers up to static typing and strongly-typed languages. TypeScript does not have the features to be the final form in the evolution of web development. There are other web development languages that solve these pain points. ReScript is that language.

ReScript is a strongly-typed language that compiles to JavaScript. It has been said of ReScript that it's what JavaScript would have been had it been `baked` a little longer. That's because its type system is sound, and with strong type inference, it has the feel of JavaScript, making it familiar. 

#### 1. A sound type system

There are no null or undefined issues in ReScript, which means the JavaScript it generates is free from null/undefined-related errors. This is major win as null/undefined-related bugs are eliminated entirely a class of bug simply by choosing this language. The same cannot be said of TypeScript. 

#### 2. Strong type inference

Its strong type inference means you can annotate the code as little or as much as you want, often leaving the feel of having written JavaScript. Familiarity is one of the reasons developers choose their next language, and ReScript is the only language I see that scores high in this area. 

#### 3. Interoperable with the JavaScript ecosystem

The main friction point is creating bindings for existing JavaScript libraries. However Claude Code is extremely good at this task. Having worked with ReScript for the past year, I've used ReScript with Astro for SSR and in the client with React no problem.

```javascript
@val @scope("localStorage") @return(nullable)
external getItem: string => option<string> = "getItem"

let theme = getItem("theme") // option<string> — None if key doesn't exist
```
<figcaption>A ReScript binding for `localStorage.getItem` — the return type is `option<string>`, making the absence of a key explicit in the type system.</figcaption>

#### 4. Web-ready

ReScript comes with React bindings, compiling to JavaScript with `react/jsx-runtime`, or if desired, with preserved JSX. This makes it a breeze to use with frameworks like Astro (a personal favorite of mine) both on the server and in the client.

```javascript
@react.component
let make = (~name) =>
  <p> {React.string("Hello, " ++ name)} </p>
```

```javascript
// Generated by ReScript, PLEASE EDIT WITH CARE

import * as JsxRuntime from "react/jsx-runtime";

function Playground(props) {
  return JsxRuntime.jsx("p", {
    children: "Hello, " + props.name
  });
}

let make = Playground;

export {
  make,
}
/* react/jsx-runtime Not a pure module */
```
<figcaption>The actual ReScript compiler output — readable, debuggable JavaScript.</figcaption>

#### 5. A gradual adoption story

TypeScript types the JavaScript that you have; you apply increasing levels of strictness to your codebase. ReScript generates JavaScript so its type system remains sound, while its presence grows in your codebase. TypeScript's approach is broad; ReScript's approach is surgical.

#### 6. Principled type narrowing

Type-narrowing is accomplished through type algebra, as one would expect of a sound type system.

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

#### 7. One level of strictness

You can't configure the type system. It has one level of strictness (maximum). This means there is only one version of ReScript you have to learn, and it has a language syntax that Claude has already mastered. Nevertheless, the essential documenation for LLMs can be found [here](https://rescript-lang.org/docs/manual/llms). 

#### 8. Safe control flows

Switch statements are truly exhaustive and try/catch blocks allow for narrowing based on the type of error. This is a breath of fresh air compared to TypeScript.

```javascript
type status = Pending | Active | Closed

let label = status =>
  switch status {
  | Pending => "pending"
  | Active => "active"
  | Closed => "closed"
  }
// Adding a new variant to `status` forces a compiler error here
```
<figcaption>Every case must be handled. Adding a new variant to the type breaks the build until the switch is updated.</figcaption>

```javascript
exception NotFound(string)

let result =
  try Some(riskyOperation())
  catch {
  | NotFound(msg) => None // narrowed — msg is a string
  }
```
<figcaption>Caught exceptions are typed, not `unknown`. The compiler knows the shape of each error branch.</figcaption>

#### 9. A more advanced type system

Control flow types such as `Result` and `Option` are present as one expects of mature typed languages. This indicates that ReScript patterns are much more developed and suitable for the complexity of the modern web.

```javascript
let divide = (a, b) =>
  if b === 0 {
    Error("Division by zero")
  } else {
    Ok(a / b)
  }

switch divide(10, 2) {
| Ok(n)    => Console.log(`Result: ${Int.toString(n)}`)
| Error(e) => Console.log(`Error: ${e}`)
}
```
<figcaption>`Result` is a first-class type in ReScript. Success and failure are both represented in the type, forcing the caller to handle both cases.</figcaption>

#### 10. Unified tooling

JavaScript is ReScript's compiler output; there is no need for linting. ReScript comes with a formatting tool for formatting ReScript code. This eliminates the maintenance headaches of typical JavaScript projects.

### Conclusion

TypeScript has done well to make JavaScript safer, but it's only a step in the evolution of web dev languages. We've become far too attached to it as the pinnacle of web development. At 13 years of age, only 2/3 developers use TypeScript. The resistance from community members should get our attention and cause us to open our eyes and ears to look for alternatives. I've made the case here that ReScript is the next step in the evolution of web dev. 