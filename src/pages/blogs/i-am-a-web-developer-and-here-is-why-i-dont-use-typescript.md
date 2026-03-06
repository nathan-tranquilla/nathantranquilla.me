---
layout: ../../layouts/Blog.astro
title: "I’m A Web Developer, Here’s Why I DON’T Use TypeScript"
author: Nathan Tranquilla
date: "2026/02/19"
updated: "2026/03/06"
tags: ["TypeScript","Type Safety","JavaScript"]
---

I stopped using TypeScript. Not because I don't care about type safety. Actually, it's the opposite. I found something that does the job better. In this post, I explain why I don't use TypeScript, and what I've replaced it with.


### Strong resistance to TypeScript
	
In 2026, <a href="https://navanathjadhav.medium.com/typescript-vs-javascript-in-2026-when-should-you-actually-use-typescript-95da08708cc6" target="_blank" rel="noopener noreferrer">67.1% of professional developers</a> use TypeScript. This means that one in three developers has resisted the encroachment of TypeScript onto JavaScript’s dynamic nature. This might be understandable if TypeScript were young, but it is now 13 years old, yet there is still strong resistance to its adoption. At this point, I don’t think this is a case of stubborn developers; TypeScript has flaws and this small group isn’t being heard. Let's enumerate the grievances.

#### 1. `as` casts weaken type guarantees

TypeScript's type system isn't sound by design: it is meant to be gradually adopted to varying degrees of strictness in your codebase. I get that TypeScript is a compromise, and I understand why, but it also means it has significant weaknesses. Here, the `as` cast makes iterating on this codebase dangerous:

```typescript
type User = { id: number; name: string; email: string };

async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return data as User; // TypeScript trusts you, no validation happens
}

const user = await getUser(1);
console.log(user.email.toUpperCase()); // crashes if API returns unexpected shape
```
<figcaption>TypeScript trusts the `as` cast without validating the response shape; the crash only surfaces when the data is used.</figcaption>

There are several problems with this approach:
1. It does not catch validation errors at the point of contact with the API. Crashes occur further down the callstack, making debugging unnecessarily difficult.
2. It does not evolve well. If the shape of the data changes from the fetch endpoint, the type system does not provide any runtime safety to catch the errors. Several languages force developers to validate data at the point of contact, providing logical branches if the data fails to match the expected shape.

#### 2. `undefined` errors are allowed at runtime

Even with `strict` mode enabled, `noUncheckedIndexedAccess` is off by default. This is too bad because a missing key can return `undefined` at runtime and the type system is not able to prevent it without this setting enabled. Matt Pocock of Total TypeScript calls it <a href="https://www.totaltypescript.com/tips/make-accessing-objects-safer-by-enabling-nouncheckedindexedaccess-in-tsconfig" target="_blank" rel="noopener noreferrer">the best feature you've never heard of</a> (published in 2023), suggesting it's not often enabled in projects.

```typescript
const myObj: Record<string, string[]> = {};

myObj.foo.push("bar"); // TypeScript: fine. Runtime: TypeError, myObj.foo is undefined
```
<figcaption>A missing key returns `undefined` at runtime, but TypeScript assumes it exists. Catching this requires enabling `noUncheckedIndexedAccess` (an opt-in, not the default).</figcaption>

#### 3. Type-narrowing is flaky

Instead of starting from a point of algebraic data types and pattern matching, TypeScript's type narrowing is based on JavaScript runtime patterns. This is error-prone, and contributes to the feeling that TypeScript is "bolted on" to JavaScript; it provides some safety, but with "gotchas". Below is an example of how TypeScript narrows the type of `x` down to `string` based on the `x !== null` runtime pattern, but a function invocation `clear()` invalidates this, causing a runtime crash.

```typescript
let x: string | null = "hello";
const clear = () => { x = null; };

if (x !== null) {
  clear();           // x is now null
  x.toUpperCase();   // TypeScript still thinks x is string, crash
}
```
<figcaption>TypeScript narrows `x` to `string` after the null check, but doesn't account for `clear()` mutating it.</figcaption>


#### 4. Control flow patterns are error-prone
`switch` and `try/catch` both have notable issues.

**`switch`**: can be written with fall-through bugs (missing `break`) and exhaustiveness gaps (missing cases), both of which are silent by default.

```typescript
type Shape = { kind: "circle" } | { kind: "square" };
function area(s: Shape) {
  switch (s.kind) {
    case "circle": return 1;
    // forgot "square", no error
  }
}
```
<figcaption>Classic case of missed type union member, a vulnerability as code evolves.</figcaption>

```typescript
switch (status) {
  case "pending":
    startTimer(); // falls through to "active", silent
  case "active":
    render();
}
```
<figcaption>A missed `break;` statement causes both `startTimer()` and `render()` to be invoked.</figcaption>

**`try/catch`**: has no typed errors. There is no support for a `throws` annotation that would help inform TypeScript of the type of error that can be caught.

```typescript
function fetchUser(id: number) {
  // Could throw NetworkError, AuthError, ParseError. TypeScript has no idea
  return fetch(`/api/users/${id}`).then(res => res.json());
}

try {
  const user = await fetchUser(1);
} catch (e) {
  // e is unknown, you must guess what to check for
  if (e instanceof NetworkError) { ... }
  if (e instanceof AuthError) { ... }
  // miss one and it goes unhandled
}
```
<figcaption>TypeScript cannot express what a function may throw. The caller has no way to know what to handle without reading the source.</figcaption>

#### 5. The type system is immature
TypeScript is missing types that embody common patterns. Let's look at the `result` and `option` types.

**`result` type**: Computations can either succeed or fail. The `result` type embodies this pattern by allowing the caller to branch on `ok` or `err`. TypeScript has no equivalent; the most accessible pattern for handling errors is `try/catch`, which as we've seen carries no type information about what might be thrown.

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

try {
  const result = divide(10, 0);
} catch (e) {
  // e is unknown, nothing in the type system told you this could throw
}
```
<figcaption>The function signature says nothing about failure. The caller has no way to know a try/catch is needed without reading the implementation.</figcaption>

**`option` type**: used to handle the presence or absence of a value. The `option` type embodies this by allowing you to branch on `some` or `none`. In TypeScript, absence is represented by a union with `null` or `undefined`, ad hoc rather than a principled type.

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

The `Promise` type proves that the concept of the `result` exists in web development; it's just not formalized in TypeScript.

```typescript
fetch("/api/user")
  .then(res => res.json())  // success branch
  .catch(err => {           // error branch
    console.error(err);
  });
```
<figcaption>`Promise` handles success and failure as first-class branches, much like the `result` type.</figcaption>

#### 6. Which version of TypeScript?

TypeScript has many versions. And I don't mean releases. What I mean is that every configuration of the TypeScript compiler changes how TypeScript works. There are hundreds of configuration options, though probably a dozen common ones for projects. This means that TypeScript behaves differently from project to project, each containing its own "gotchas" that developers have to learn. Here are a few settings that are off by default and considered <a href="https://www.totaltypescript.com/tsconfig-cheat-sheet" target="_blank" rel="noopener noreferrer">too noisy</a> to turn on:

1. `noUncheckedIndexedAccess`. Changes the return type to `T | undefined`.
    ```typescript
    const items = ["a", "b", "c"];
    const x = items[99]; // type: string (default), undefined at runtime
    ```

2. `noImplicitReturns`. This prevents functions from silently returning `undefined`.
    ```typescript
    function getLabel(status: string): string {
      if (status === "active") return "Active";
      // Implicit "undefined" return here.
    }
    getLabel("inactive").toUpperCase(); // TypeError
    ```
3. `noFallthroughCasesInSwitch`. This setting prevents a common footgun when writing switch statements. Without it enabled, developers can write switch statements that process multiple case statements unintentionally.
    ```typescript
    switch (status) {
      case "pending":
        startTimer(); // falls through silently
      case "active":
        render();
    }
    ```

These three settings affect the type safety and control flow patterns of TypeScript in ways that are very impactful. These three settings alone create 2³ = 8 distinct "versions" of TypeScript that a developer must master.

#### 7. TypeScript doesn't attempt to unify the tooling
The JavaScript ecosystem is fragmented. Starting a fresh TypeScript project still means managing `tsconfig.json`, `eslint.config.js`, `.prettierrc`, and a bundler config, not to mention that eslint and prettier have overlapping concerns. TypeScript solved the type problem and left everything else exactly where it was. Rust ships `rustfmt` and ReScript ships `rescript format`. TypeScript had the opportunity to consolidate tooling and did not. This has left the ecosystem as fragmented as it was before TypeScript arrived.

### The Alternative
One thing TypeScript has done well is warm developers up to static typing and strongly-typed languages. TypeScript isn't the destination, but it is a step in the evolution of web dev. TypeScript bridges to ReScript.

ReScript is a strongly-typed language that compiles to JavaScript. ReScript is what JavaScript would have been had it been "baked" longer. ReScript's type system is sound and has strong type inference, giving it the feel of JavaScript.

#### 1. A sound type system

ReScript has no null or undefined. This is a major win, as an entire class of bugs is eliminated simply by choosing this language. The same cannot be said of TypeScript.

```javascript
let items = ["a", "b", "c"]

let x = items[99] // option<string>, None not undefined

switch x {
| Some(s) => Console.log(s)
| None => Console.log("out of bounds")
}
```
<figcaption>Array access returns `option<string>`, not `string`. The compiler forces you to handle both cases.</figcaption>

```javascript
// Generated by ReScript, PLEASE EDIT WITH CARE
let items = ["a","b","c"];

let x = items[99];

if (x !== undefined) {
  console.log(x);
} else {
  console.log("out of bounds");
}
```
<figcaption>The compiled JavaScript output. Null/undefined safety without runtime overhead.</figcaption>

#### 2. Principled type-narrowing

Type-narrowing is accomplished through algebraic data types and pattern matching, as one would expect of a sound type system. Notice the contrast between TypeScript's type-narrowing approach based on JavaScript runtime patterns versus a principled approach based on types.

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
<figcaption>The <a href="https://rescript-lang.org/docs/manual/api/stdlib/type/#type-t" target="_blank" rel="noopener noreferrer">possible types</a> of JavaScript values. </figcaption>

```javascript
let describe = value =>
  switch Type.typeof(value) {
  | #string  => "a string"
  | #number  => "a number"
  | #boolean => "a boolean"
  | #object  => "an object"
  | #function => "a function"
  | #bigint  => "a bigint"
  | #symbol  => "a symbol"
  | #undefined => "undefined"
  }
```
<figcaption>`Type.typeof` returns a `Type.t` variant. Pattern matching on it narrows exhaustively; the compiler errors if any case is missing.</figcaption>

#### 3. Safe control flows

Switch statements are truly exhaustive, and try/catch blocks allow for narrowing based on the type of error, both direct answers to the control flow problems in TypeScript.

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
  | NotFound(msg) => None // narrowed, msg is a string
  }
```
<figcaption>Caught exceptions are typed, not `unknown`. The compiler knows the shape of each error branch.</figcaption>

#### 4. A more advanced type system

Types such as `Result` and `Option` are present as one expects of mature typed languages. TypeScript acknowledges the `Result` pattern implicitly through `Promise`, but `Result` is a first-class type in ReScript.

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

// Compiles to
function divide(a, b) {
  if (b === 0) {
    return {
      TAG: "Error",
      _0: "Division by zero"
    };
  } else {
    return {
      TAG: "Ok",
      _0: Primitive_int.div(a, b)
    };
  }
}

let n = divide(10, 2);

if (n.TAG === "Ok") {
  console.log(`Result: ` + n._0.toString());
} else {
  console.log(`Error: ` + n._0);
}
```
<figcaption>`Result` is a first-class type in ReScript. Success and failure are both represented in the type, forcing the caller to handle both cases.</figcaption>

#### 5. One version of ReScript

You can't configure the type system. It has one level of strictness (maximum). This means there is only one version of ReScript you have to learn.

#### 6. Unified tooling

JavaScript is ReScript's compiler output; there is no need for linting. ReScript ships with `rescript format`, a built-in formatter. This eliminates the maintenance headaches of typical JavaScript projects.

#### 7. Strong type inference

Its strong type inference means you can annotate the code as little or as much as you want, and it still reads like JavaScript. Familiarity is a factor in how new languages are chosen, which makes ReScript the most accessible path to a stronger type system.

```javascript
let add = (a, b) => a + b            // (int, int) => int
let greet = name => "Hello, " ++ name // string => string
let isAdult = age => age >= 18        // int => bool

// Compiles to

function add(a, b) {
  return a + b | 0;
}

function greet(name) {
  return "Hello, " + name;
}

function isAdult(age) {
  return age >= 18;
}
```
<figcaption>No type annotations: ReScript infers them all. The code reads like JavaScript.</figcaption>

#### Bonus: why it works in practice

#### Interoperable with the JavaScript ecosystem

The main friction point is creating bindings for existing JavaScript libraries. However, AI tools have reduced this tension significantly. Having worked with ReScript for the past year, I've used ReScript with Astro for SSR and in the client with React seamlessly.

```javascript
@val @scope("localStorage") @return(nullable)
external getItem: string => option<string> = "getItem"

let theme = getItem("theme") // option<string>, None if key doesn't exist
```
<figcaption>A ReScript binding for `localStorage.getItem` with `option<string>` return type</figcaption>

#### Web-ready

ReScript comes with React bindings, compiling to JavaScript with `react/jsx-runtime`, or if desired, with preserved JSX. This makes it seamless to use with frameworks like Astro (a personal favorite of mine) both on the server and in the client.

```javascript
@react.component
let make = (~name) =>
  <p> {React.string("Hello, " ++ name)} </p>

// Compiles to

import * as JsxRuntime from "react/jsx-runtime";

function Playground(props) {
  return JsxRuntime.jsx("p", {
    children: "Hello, " + props.name
  });
}
```
<figcaption>The actual ReScript compiler output.</figcaption>

#### A gradual adoption story

TypeScript types the JavaScript that you have; you apply increasing levels of strictness to your codebase. ReScript generates JavaScript, so its type system remains sound, while its presence grows in your codebase. TypeScript's approach is broad; ReScript's approach is surgical.

### Conclusion

TypeScript has done well to make JavaScript safer, but it's a bridge to ReScript. We've become far too attached to TypeScript as the pinnacle of web development. At 13 years of age, only 2/3 of developers use TypeScript. The resistance from community members should not be dismissed, as I've demonstrated that TypeScript has significant weaknesses. If you'd like to learn more about ReScript, check out <a href="https://youtu.be/ANrLu4yjDUY?si=XZwBSq6jQ8tKDVM2" target="_blank" rel="noopener noreferrer">this video</a>.