---
layout: ../../layouts/Blog.astro
title: ReScript, offspring of JavaScript and TypeScript
author: Nathan Tranquilla
date: "2025/10/29"
tags: ["ReScript"]
---

ReScript is the best of JavaScript and TypeScript combined. This is because it feels familiar while fixing fundamental problems. Other posts have focused on how [ReScript fixes TypeScript](/blogs/5-ways-rescript-fixes-typescript/); this post focuses on why ReScript is likely to be adopted. Developers choose their next language because it's familiar enough to learn quickly, yet powerful enough to solve current pain points. 

TypeScript has done well to warm JavaScript developers up to strong type systems. Now that people are rethinking TypeScript, there is an opportunity to make the natural jump from a transitionary language like TypeScript to a strongly typed language that is a natural and compelling extension from both JavaScript and TypeScript. That option is ReScript.

In this example, I note 7 similarities between ReScript and its parents, JavaScript and TypeScript, which make it likely to be adopted:

### Fetching Data, Combining Results

```js
type combined = {task: string, postTitle: string, userId: int, completed: bool, body: string}

let fetchAndCombine = async (): result<combined, string> => {
  open Promise
  open Webapi
  let (todoJson, postJson) = await Promise.all2((
    Fetch.fetch("https://jsonplaceholder.typicode.com/todos/1")->then(Fetch.Response.json),
    Fetch.fetch("https://jsonplaceholder.typicode.com/posts/1")->then(Fetch.Response.json),
  ))

  switch (todoJson, postJson) {
  | (Object(todoDict), Object(postDict)) => {
      open Dict
      switch (
        todoDict->get("title"),
        todoDict->get("userId"),
        todoDict->get("completed"),
        postDict->get("title"),
        postDict->get("body"),
      ) {
      | (
          Some(String(todoTitle)),
          Some(Number(userIdFloat)),
          Some(Boolean(completed)),
          Some(String(postTitle)),
          Some(String(body)),
        ) =>
        Ok({
          task: todoTitle,
          postTitle,
          userId: userIdFloat->Belt.Float.toInt,
          completed,
          body,
        })
      | _ => Error("Failed to parse JSON fields with expected types")
      }
    }
  | _ => Error("Response is not a JSON object")
  }
}

// Usage
fetchAndCombine()
->Promise.thenResolve(result => {
  switch result {
  | Ok(res) => Js.log(res)
  | Error(err) => Js.log(err)
  }
})
->ignore
```

This is a complete example demonstrating how to fetch data from two API endpoints in ReScript, await the promise values from both, pattern match on the result, use dictionary types to parse the JSON, and combine the data into a result type (ok/error). Along the way, we use modules `Promise` and `Webapi` for promise and fetch functionality. We will go through each of these concepts in the paragraphs that follow. 

### `async` / `await` Keywords

The `fetchAndCombine` function is where we fetch `todo` data and `post` data. The `async` keyword is placed before the parameter list `()`, which qualifies the function as asynchronous. Later on in the function, we `await` the value of two fetch requests, which are promises. Comparing this code to its generated output, we can see how similar these code snippets appear:

```js

// ReScript
open Promise
open Webapi
let (todoJson, postJson) = await Promise.all2((
  Fetch.fetch("https://jsonplaceholder.typicode.com/todos/1")->then(Fetch.Response.json),
  Fetch.fetch("https://jsonplaceholder.typicode.com/posts/1")->then(Fetch.Response.json),
))

// Corresponding generated JavaScript code
var match = await Promise.all([
  fetch("https://jsonplaceholder.typicode.com/todos/1").then(function (prim) {
        return prim.json();
      }),
  fetch("https://jsonplaceholder.typicode.com/posts/1").then(function (prim) {
        return prim.json();
      })
]);
```

### `open` Statements

You likely noticed the `open Promise` and `open Webapi` statements. These bring the module contents into the current scope, so you can use their functions directly without the module prefix. In the case of this fetch statement, here is what the code would look like without the `open` statements:

```js
Webapi.Fetch.fetch("https://jsonplaceholder.typicode.com/todos/1")
->Promise.then(Webapi.Fetch.Response.json)
```

You may follow this style if it promotes clarity; you may have noticed the use of `Promise.all2` as this closely mirrors conventions in JavaScript for more clarity and familiarity. 


### Expressions

The `switch` expression is an example of something familiar that is fixed. The `switch` is not a _statement_, it is an _expression_; the switch expression evaluates to a value. Almost everything in ReScript is an expression that returns a value. Because of this, the `return` is implicit. 

```js
// Switch expression - assigns result directly
let value = switch optionalThing {
| Some(thing) => thing 
| None => "empty"
}

// If expression - also returns a value
let value2 = if something > 0 { "hi" } else { "bye" }
```

What does this fix? If you have ever had to write a JavaScript switch statement, you know it lacks good ergonomics. You must assign a value within the switch statement to a variable outside of the switch scope. Not so with ReScript. You can assign the value directly from the switch expression.

Now let's see how this applies to our fetch function. Notice that the complex nested switch returns an `Ok` or `Error` value without any explicit `return` statements:

```js
switch (todoJson, postJson) {
  | (Object(todoDict), Object(postDict)) => {
      open Dict
      switch (
        todoDict->get("title"),
        todoDict->get("userId"),
        todoDict->get("completed"),
        postDict->get("title"),
        postDict->get("body"),
      ) {
      | (
          Some(String(todoTitle)),
          Some(Number(userIdFloat)),
          Some(Boolean(completed)),
          Some(String(postTitle)),
          Some(String(body)),
        ) =>
        Ok({
          task: todoTitle,
          postTitle,
          userId: userIdFloat->Belt.Float.toInt,
          completed,
          body,
        })
      | _ => Error("Failed to parse JSON fields with expected types")
      }
    }
  | _ => Error("Response is not a JSON object")
  }
```

The entire switch expression evaluates to either an `Ok` result with our combined data, or an `Error` with a descriptive message. This is the last expression in our `fetchAndCombine` function, so it becomes the function's return value automatically.

### Pattern Matching / Destructuring

Pattern matching and destructuring are not only familiar in ReScript, they're also significantly improved. TypeScript has some exhaustiveness checking, but it requires specific compiler flags and careful coding patterns. The `switch` expression in ReScript is exhaustive by default and supports powerful destructuring. Just take a look at our example:


```js
switch (
  todoDict->get("title"),
  todoDict->get("userId"),
  todoDict->get("completed"),
  postDict->get("title"),
  postDict->get("body"),
) {
| (
    Some(String(todoTitle)),
    Some(Number(userIdFloat)),
    Some(Boolean(completed)),
    Some(String(postTitle)),
    Some(String(body)),
  ) =>
  Ok({
    task: todoTitle,
    postTitle,
    userId: userIdFloat->Belt.Float.toInt,
    completed,
    body,
  })
| _ => Error("Failed to parse JSON fields with expected types")
}
```

What makes this pattern matching so powerful? Let's break down what's happening. When we access dictionary keys like `todoDict->get("title")`, we might get a value or we might not - this is represented with the `option` type (`Some(value)` or `None`). Additionally, JSON values can be different types: strings, numbers, booleans, objects, arrays, or null.

In TypeScript, you'd need multiple type guards and null checks:

```typescript
// TypeScript approach - verbose and error-prone
if (todoDict.title && typeof todoDict.title === 'string' &&
    todoDict.userId && typeof todoDict.userId === 'number' &&
    todoDict.completed && typeof todoDict.completed === 'boolean') {
  // ... still need to handle potential runtime errors
}
```

But ReScript's pattern matching lets us handle both the optionality and type checking in one elegant expression:

```js
switch (
  todoDict->get("title"),
  todoDict->get("userId"),
  todoDict->get("completed"),
) {
| (
    Some(String(todoTitle)),
    Some(Number(userIdFloat)), 
    Some(Boolean(completed)),
  ) =>
  // All values are guaranteed to be the right type
  Ok(...)
| _ => Error("Missing or wrong types")
}
```

This combines the familiarity of TypeScript's type checking with the power and safety that TypeScript can't quite achieve.

To see the full power of ReScript pattern matching and destructuring, see [the docs](https://rescript-lang.org/docs/manual/v11.0.0/pattern-matching-destructuring).

### More Expressive Types

ReScript's type system is more expressive than TypeScript's because it doesn't carry the burden of JavaScript backwards compatibility. TypeScript must remain a "gradual" type system, layered on top of JavaScript. ReScript, compiling to clean JavaScript, can express concepts that TypeScript struggles with.

Consider common patterns that TypeScript developers recognize but can't express cleanly. Take our `fetchAndCombine` function - in TypeScript, you'd likely use a union type to represent success or failure:

```typescript
const CombinedSchema = z.object({
  task: z.string(),
  postTitle: z.string(),
  userId: z.number().int(),
  completed: z.boolean(),
  body: z.string(),
});

type Combined = z.infer<typeof CombinedSchema>;

async function fetchAndCombine(): Promise<Combined | { error: string }> {
  // ...
}
```

The type signature `Combined | { error: string }` works, but it's a workaround. What you really want to express is "success value OR error value" - a fundamental concept in programming that deserves first-class support.

ReScript provides this through built-in types like `result`:

```js
let fetchAndCombine = async (): result<combined, string> => {
  // ...
}
```

This isn't just syntax sugar - it's a more precise way to model reality. TypeScript developers already think in these patterns (optional values, success/failure, validated data), but they have to encode them through conventions and library types. ReScript makes these patterns first-class citizens of the type system. 

And yet we can thank TypeScript for making this transition seem natural - the jump to ReScript without TypeScript would have been too sudden and strange.

### Type Inference

What makes ReScript feel familiar to JavaScript developers is how little you need to write to get strong type safety. ReScript has powerful type inference, which means you can write code that looks almost like JavaScript while getting all the benefits of a strong type system.

Consider our `fetchAndCombine` function. We could have written it without any type annotations:

```js
let fetchAndCombine = async () => {
  // ... fetch logic ...
  
  switch (todoJson, postJson) {
  | (Object(todoDict), Object(postDict)) => 
    // ... parsing logic ...
    Ok({task: todoTitle, postTitle, userId, completed, body})
  | _ => Error("Response is not a JSON object")
  }
}
```

ReScript would still infer the complete type `(): result<combined, string>` just from analyzing the return values. You get TypeScript-level type safety with JavaScript-level brevity.

This is what makes ReScript approachable - it doesn't force you to think like a type theorist upfront. You can write code that feels natural and add type annotations only where they improve clarity. 

### Conclusion

ReScript is familiar. There is no other language out there that looks like JavaScript and has a type system to rival TypeScript. It is my opinion that a ReScript codebase could be easily maintained by a JavaScript or TypeScript developer with no ReScript experience. This is a powerful aspect of a language, since it means there is minimal friction between the development and maintenance from the broader JavaScript community.

In this way, ReScript satisfies one of the 4 pillars of Next-Gen Web Dev: Language Lineage.

---

[Sign up to my newsletter](https://nathantranquilla.kit.com/0d8a3f84b7) to get more Next-Gen Web Dev insights!








