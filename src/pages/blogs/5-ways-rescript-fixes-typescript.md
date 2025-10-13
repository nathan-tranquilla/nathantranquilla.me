---
layout: ../../layouts/Blog.astro
title: 5 Ways ReScript Fixes TypeScript
author: Nathan Tranquilla
date: "2025/09/24"
tags: ["ReScript"]
---

ReScript is like TypeScript except better. Some say that ReScript is what JavaScript would have been if it had more time in the oven. Its type system, which is the focus of this post, is much more complete than TypeScript's, making it a great choice as a Next Generation Web Development language. The goal of _**Next Gen Web Dev**_ is to make web apps more reliable and robust, making the process safer for developers, and the experience of the web more enjoyable. Here are 5 problematic areas in TypeScript's type system that are fixed in ReScript.

### Unsafe Array Access

In TypeScript, you can unsafely access array elements and receive `undefined`, even with strict settings enabled. This happens because TypeScript's goal is to be a _static_ overlay on JavaScript for compatibility reasons. Consequently, dynamic array access and its inherent safety risks cannot be prevented at compile time.

```js
function unsafeDynamicAccess(arr: number[], dynamicIndex: number): number  {
  // Dynamic index access: TS doesn't check bounds, so this compiles fine.
  // But if dynamicIndex >= arr.length, it returns undefined at runtime.
  return arr[dynamicIndex];
}

// Example usage
const myArray: number[] = [10, 20, 30]; // Length 3

for (let i = 0; i <= 4; i++) {
  const result = unsafeDynamicAccess(myArray, i);
  console.log(result); // Outputs: 10, 20, 30, undefined, undefined (unsafe access!)
}
```

In ReScript, it's not possible to access elements of arrays unsafely, no matter the particular syntax you use. Here is an example of accessing elements in an array in ReScript, in two different ways.

```js
let myArray = ["hello", "world", "how are you"]

let firstItem = myArray[0] // Some("hello")

let tenthItem = myArray->Array.get(10) // None
```

No matter which way you choose, you are always protected with the `option` type, which forces the developer to code all cases.

### Null Safety

TypeScript improves upon JavaScript's lack of null safety; you must acknowledge a type is nullable through a typed union. For example, when accessing the DOM, the element might be `null`.

```js
const element: HTMLElement | null = document.getElementById('nonexistent');
```

Do you know what's better than handling `null`s? Not having `null`s at all—which is the case with ReScript, which eliminates an entire class of bugs. In ReScript, if we want to handle the presence or absence of something, we use the `option` type.

```js
let getById = (id: string): option<Dom.element> => document->Document.getElementById(id);

switch getById("nonexistent") {
| Some(el) => Console.log(el)
| None => Console.log("Element not found on page")
}
```

### Implicit Conversion

TypeScript makes implicit conversion harder to do, but it's still possible to stumble into it. Below is an example where unexpected type coercion can cause runtime errors:

```js
function compareValues(a: string | number, b: string | number): boolean {
  return a < b;
}

// Examples
console.log(compareValues("10", "2"));  // true (lexicographical comparison), but should be false
console.log(compareValues(10, "2"));    // false
console.log(compareValues("2", "10"));  // false (lexicographical comparison), but should be true
console.log(compareValues("2", 10));    // true

// Right 50% of the time, and might even pass unit tests if not tested carefully
```

This example is relatable to a JavaScript developer. Numbers are often represented as strings, and it would be tempting to allow `a` and `b` to be of type `string | number` instead of coercing the string to a number at the source. Fifty-percent of test cases will pass, due to implicit conversion, if the developer happens to be unfortunate enough to test `compareValues` incompletely.

ReScript does not allow implicit conversion at all. You must explicitly convert from one type to another, if it is allowable. This eliminates an entire category of runtime surprises that plague JavaScript and can still occur in TypeScript.

```js
type a = {
  name: string,
  age: int,
}

type b = {
  name: string,
  age: int,
}

let nameFromB = (b: b) => b.name

let a: a = {
  name: "Name",
  age: 35,
}

let name = nameFromB(a :> b)
```

### Duck Typing

In TypeScript, there is no nominal distinction between types. This means that if objects have the same shape, they are treated as the same type. This can lead to semantic errors. Here is an example where a debt could be mistaken for an account balance.

```js
interface UserProfile {
  id: string;
  balance: number
}

interface PaymentDetails {
  id: string,
  balance: number;
  dueDate?: string
}

const displayFunds = (profile: UserProfile) => `Funds : ${profile.balance}`;
const apiData: PaymentDetails = {id: "123", balance: 50, dueDate: "2025-01-01"};
console.log(displayFunds(apiData));
```

In ReScript, type compatibility is based on explicit type names or declarations rather than structural shape. This means you can create distinct types that prevent semantic confusion, even if they have identical structures. The compiler enforces these distinctions, catching errors that would slip through TypeScript's structural typing system.

### Exhaustiveness Checking

In TypeScript, you can achieve exhaustiveness checking if you have the right settings enabled, and if you code the switch statement correctly. It involves using the `never` keyword. Here is a valid example of a TypeScript `switch` statement that works, but doesn't use the `never` keyword in the default case. If any additional types variants are added, the code still compiles, resulting in runtime errors, because the `never` keyword is not used in the coding of this switch statement.

```js
type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; side: number };

function area(shape: Shape) {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    default:
      return shape.side ** 2
  }
}

const s: Shape = { kind: 'square', side: 4 };
console.log(area(s));
```

In ReScript, there is true exhaustiveness checking built into the language. The compiler needs no additional input from the developer to understand that all cases must be covered. If you add a new variant to a union type, the compiler will immediately flag every pattern match that doesn't handle the new case.

```js
type shape =
  | Circle(float)
  | Square(float)

open Core

let area = (shape: shape): float => {
  switch shape {
  | Circle(r) => Math.Constants.pi *. r *. r
  | Square(s) => s *. s
  }
}

let s = Square(4.0)
Js.log(area(s))  // Outputs: 16.0
```

### The Next Generation Web Development Choice

These five examples highlight a fundamental difference in philosophy. TypeScript aims to add static typing to JavaScript while maintaining compatibility and familiar syntax. ReScript, on the other hand, prioritizes correctness and safety above all else.

For **Next Gen Web Development**, this distinction is crucial. We're not just looking for better tooling—we're looking for languages that eliminate entire classes of bugs before they reach production. ReScript delivers on this promise:

- **Zero runtime exceptions** from null/undefined access
- **Guaranteed array bounds safety**
- **Complete exhaustiveness checking** without developer intervention
- **Semantic type safety** that prevents business logic errors
- **Explicit conversions** that eliminate surprise type coercion

While TypeScript represents an improvement over plain JavaScript, ReScript represents the future: a language designed from the ground up for reliability, safety, and developer confidence. For teams serious about building robust web applications, ReScript offers the type safety guarantees that TypeScript simply cannot provide.

The choice is clear: continue managing JavaScript's chaos with increasingly complex tooling, or embrace a language that eliminates the chaos entirely. That's the Next Gen Web Development difference.

---

_**Ready to eliminate TypeScript's compromises and build truly reliable web applications?** [Schedule a consultation →](/consultation)_
