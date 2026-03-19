---
layout: ../../layouts/Blog.astro
title: "Coding Is Not For Humans"
author: Nathan Tranquilla
date: "2026/03/19"
tags: ["AI","Coding"]
---

Coding is no longer a human task. Overstatement? At my day job, AI agents write the majority of code. In my personal projects, I no longer write code at all. If coding belongs to AI now, do the human-centric battles around code still matter: clean code patterns or dynamic vs static type systems? What is the role of the human?


### No One Cares About Clean Code (Anymore)

Clean code is a pattern of writing code that makes it easy for other humans to reason about, facilitating human collaboration across projects and time. A great example of a clean code practice is the `early return` in which exit conditions are placed early in the code block. 

<figure>
<figcaption>Before</figcaption>

```javascript
function greet(user) {
  if (user) {
    if (user.isActive) {
      if (user.name) {
        return "Hello, " + user.name;
      } else {
        return "Hello, stranger";
      }
    } else {
      return "Account inactive";
    }
  } else {
    return "No user";
  }
}
```

</figure>

<figure>
<figcaption>After</figcaption>

```javascript
function greet(user) {
  if (!user)          return "No user";
  if (!user.isActive) return "Account inactive";
  if (!user.name)     return "Hello, stranger";
  return "Hello, " + user.name;
}
```

</figure>

The first is difficult for humans to parse because it requires a human to cognitively hold multiple conditions at once, while the "happy path" is buried in nested conditions. The second is simpler for humans because it does not overload the human's cognition; instead it reads more like a checklist, which humans can read and tick-off immediately. 

But all this no longer matters because AI reads and writes its own code now, and it's generally good at writing code that it can read again with ease. We're still stewards of code, but the patterns we curate are for AI agents (more on this later).

### Ergonomics Take A Backseat

Given that coding is now AI-driven, does the battle over dynamic vs statically typed languages matter? This battle has been about human preferences over the art of coding. Dynamic languages let you move faster, but often come with less certainty on the operation of types (product ships quicker but has preventable bugs). Static typing imposes more rigidity at development time, which adds a burden to developers, but type operations are guaranteed (ships slower, but fewer bugs). 

The level of certainty you achieve depends on the *soundness* of the type system. Not all statically typed languages are equal. Consider TypeScript:

```typescript
function getUser(id: string): User {
  return db.users.find(u => u.id === id) as User; // as User bypasses null check
}

const user = getUser("123");
console.log(user.name); // compiles fine, but crashes at runtime if user wasn't found
```

TypeScript lets you write `as User` to escape the type system. The compiler accepts it, but the code crashes at runtime. Now consider the same scenario in ReScript, a language with a sound type system:

```rescript
let getUser = (id: string): option<user> => {
  users->Array.find(u => u.id === id)
}

switch getUser("123") {
| Some(user) => Console.log("Hello " ++ user.name)
| None => Console.log("User not found")
}
```

There is no escape hatch. The compiler returns an `option<user>`, and you must handle both cases. If you forget the `None` branch, the code doesn't compile. The result: no null crashes at runtime, guaranteed.

This is the kind of type system we should be picking for AI. Sound types act as a feedback loop; when AI generates incorrect code, the compiler rejects it before it ships. Without that feedback loop, bugs pass silently into production.

### What is the role of the developer?

The proficiency of AI agents at writing code has led to a shift that has many developers questioning their role. What used to occupy a lot of the developer's time (writing code) now takes up much less time. I recently consulted with a non-engineer about their vibe-coded project. It was amazing how quickly an app can be templated. But among the many problems I saw, it was clear that a vibe coder can template an app fast, but they can't establish the patterns that compound. That's the developer's job now.

One aspect of long-term maintenance is stewardship over code patterns that allow AI to extend your codebase with ease. This is a powerful feature of AI-driven development; it can result in compounding gains, or compounding pains. With great patterns established, AI can plan your next feature by examining existing patterns and extending them. But it also means that if the codebase has poor patterns, it is up to the developer to understand this and steer AI down a different path to establish better patterns. 

### Conclusion

The human's role in coding is taking a backseat, but don't panic. Your knowledge as a software developer is still very valuable. The software developer's career has always been a progression away from the details of coding; AI has simply made this transition happen earlier in your career.

Don't worry about clean code, worry about directing AI towards better patterns. Don't use dynamic languages, your preferences in this area don't matter any longer. Software languages are for AI, and AI doesn't care, so choose type certainty.