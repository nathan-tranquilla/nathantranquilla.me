---
layout: ../../layouts/Blog.astro
title: 3 Ways To Evolve Your React App From TypeScript to ReScript
author: Nathan Tranquilla
date: "2025/11/11"
tags: ["ReScript"]
---

As a professional web developer, I have watched web development evolve from JavaScript to TypeScript
and have been eagerly awaiting what comes next. When I investigated ReScript, it clicked for me—this
is just like JavaScript and TypeScript combined, with a reimagined type system! Here are 3 ways you
can evolve your React application beyond TypeScript today!

### What is ReScript?

ReScript is a web development language that has emerged from the OCaml ecosystem. It has the
familiarity of JavaScript and TypeScript with excellent type inference, so you don't have to
annotate everything with types. It compiles to safe JavaScript code, making it easily usable in web
development projects. It also has first-class bindings for React, both on the server and client.
With that context, let's look at the first way you can evolve your React app beyond TypeScript.

**Note**: If you want to know how to integrate ReScript and its React bindings into your project and
build system, check out [this video](https://youtu.be/xWsPcGocgNI?t=142&si=aCqqDMMaO92t9_h3).

### 1. Add ReScript Components

The simplest way to evolve your application is to add a new ReScript React component. This is as
simple as creating a file with a `.res` extension. Once ReScript successfully compiles, it outputs a
corresponding `.res.mjs` file. With the `@react.component` annotation, it's easy to create React
components:

**A. Creating a ReScript React Component**
```js
// ./src/components/User.res

@react.component
let make = (~username) => {

  <span>
    {React.string(username)}
  </span>
} 
```

Let's go over some syntax. First, we have the `@react.component` annotation, which creates a
submodule with `make` and `props` type. We use this annotation to make things simple. Second, note
that JSX syntax is used to create our React element. Third, `React.string` is of type
`React.element`—strings must be converted to `React.element` through the `React.string` method. The
same is true for `React.int`, `React.float`, and `React.array`. Finally, props are labeled arguments
in ReScript. In this case, we've added `username`. Thanks to type inference, we did not need to
specify the type of the prop, but we could have easily done so: `~username: string`.

Simply import and use it in your TypeScript or JavaScript file:

```js
import { make as User } from 'components/User.res.mjs'

// Use it in your JSX like any other React component
function UserProfile() {
  return (
    <div>
      <h1>User Profile</h1>
      <User username="john_doe" />
      <User username="jane_smith" />
    </div>
  )
}
```

**B. Using TypeScript/JavaScript Components in ReScript**

Occasionally, you may need to reuse a component that already exists in your codebase within the
ReScript component hierarchy. If so, you can create bindings for them:

```js

// ./src/components/User.res

module OtherInfo = {
  @module("./components/OtherInfo.tsx") @react.component
  external make: (~id: string) => React.element = "default"
}

@react.component
let make = (~username: string, ~id: string) => {

  <span>
    {React.string(username)}
    <OtherInfo id={id} />
  </span>
} 
```

Though real-world applications are more complex, the strategy remains the same. Here is a video
showing an example of mixing TypeScript and ReScript components within the same app: <TODO: video
link here>

### 2. Upgrade Your Redux Reducers

You don't have to write React code with ReScript. You can take advantage of ReScript's improved
ergonomics to write better logic. ReScript has improved the ergonomics of JavaScript's `switch` and
`if` statements. In ReScript, `switch` and `if` are expressions that evaluate to values, which you
can bind directly from the expressions, and the `switch` expression is truly exhaustive without
tweaking settings.

Let's say your reducer switches on the Redux action type. You can write a function in ReScript and
import it into your Redux code for use inside the reducer.

```js
// ./src/reducers/userReducerLogic.res

@string
type actionType = 
  | @as("FETCH_USER_SUCCESS") FetchUserSuccess
  | @as("FETCH_USER_ERROR") FetchUserError  
  | @as("UPDATE_USER_SUCCESS") UpdateUserSuccess

type user = {
  id: string,
  name: string,
  email: string,
}

type state = {
  user: option<user>,
  loading: bool,
  error: option<string>,
  isUpdating: bool,
}

let handleUserAction = (state: state, actionType: actionType, payload: 'a): state => {
  switch actionType {
  | FetchUserSuccess => {
      ...state,
      user: Some(payload),
      loading: false,
      error: None,
    }
  | FetchUserError => {
      ...state,
      loading: false,
      error: Some("fetch error"),
    }
  | UpdateUserSuccess => {
      ...state,
      user: Some(payload),
      isUpdating: false,
    }
  }
}
```

This generates the following code, which is easily usable in your Redux files:
```js
// ./src/reducers/useReducerLogic.res.mjs 
// Generated by ReScript, PLEASE EDIT WITH CARE


function handleUserAction(state, actionType, payload) {
  switch (actionType) {
    case "FETCH_USER_SUCCESS" :
        return {
                user: payload,
                loading: false,
                error: undefined,
                isUpdating: state.isUpdating
              };
    case "FETCH_USER_ERROR" :
        return {
                user: state.user,
                loading: false,
                error: "fetch error",
                isUpdating: state.isUpdating
              };
    case "UPDATE_USER_SUCCESS" :
        return {
                user: payload,
                loading: state.loading,
                error: state.error,
                isUpdating: false
              };
    
  }
}

export {
  handleUserAction ,
}
/* No side effect */

``` 

### 3. Handle Complex Data Types

You can also use ReScript to solve those tough-to-represent scenarios that often occur when parsing
data. Here's an example of a heterogeneous array—a tough problem to solve in TypeScript—and how
ReScript handles parsing these elements.

```js
// ReScript version - ./src/utils/processItems.res
@unboxed
type item = 
  | String(string) 
  | Number(float) 
  | Boolean(bool) 
  | User({name: string})

let processItems = (items: array<item>) =>
  items->Array.map(item => 
    switch item {
    | String(s) => `Text: ${s}`
    | Number(n) => `Count: ${n->Float.toString}`
    | Boolean(b) => b ? "Yes" : "No" 
    | User({name}) => `User: ${name}`
    })
```

Let's walk through this code. First, the items in the array are represented as either strings,
numbers, booleans, or objects. Second, the `@unboxed` annotation means that the variant's payload (a
string, number, boolean, or object) is all that's left at runtime. This becomes clearer when we
examine the output and discover that `typeof` is used to discriminate between the items.

```js
// Generated by ReScript, PLEASE EDIT WITH CARE


function processItems(items) {
  return items.map(function (item) {
              switch (typeof item) {
                case "string" :
                    return "Text: " + item;
                case "number" :
                    return "Count: " + item.toString();
                case "boolean" :
                    if (item) {
                      return "Yes";
                    } else {
                      return "No";
                    }
                case "object" :
                    return "User: " + item.name;
                
              }
            });
}

export {
  processItems
}
```

By examining the output, we can see that the interop between this generated code and JavaScript code
is seamless—this function can be used directly in TypeScript or JavaScript codebases as-is.

**Note:** If you have a keen eye, you might have noticed some limitations: there's no way to
distinguish between two unboxed types at runtime (e.g., `String1(string) | String2(string)`).

### Conclusion

You now have three clear paths forward to evolve your TypeScript & React codebase: (1) adding
ReScript components, (2) upgrading your Redux reducers, and (3) handling complex data types. If this
was valuable to you, please sign up for [my newsletter](https://nathantranquilla.kit.com/0d8a3f84b7)
where you can receive direction on the future of web development delivered directly to your inbox.
