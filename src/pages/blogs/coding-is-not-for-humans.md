---
layout: ../../layouts/Blog.astro
title: "Coding Is Not For Humans"
author: Nathan Tranquilla
date: "2026/03/19"
tags: ["AI","Coding"]
---

Coding is no longer a human task. At my day job, AI agents write the majority of code. In my personal projects, I no longer write code at all. If coding belongs to AI now, do the human-centric battles around code still matter: clean code patterns or dynamic vs static type systems? What is the role of the human?


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

But all this no longer matters because AI reads and writes its own code now, and it's generally good at writing code that it can read again with ease. That doesn't mean coding standards are completely meaningless; humans still have an important role (more on this later). 

### Human Preferences Disappear

Given that coding is now AI-driven, does the battle over dynamic vs statically typed languages matter? This battle has been about human preferences over the art of coding. Dynamic languages let you move faster, but often come with less certainty on the operation of types (product ships quicker but has preventable bugs). Static typing imposes more rigidity at development time, which adds a burden to developers, but type operations are guaranteed (ships slower, but fewer bugs). 

The level of certainty you achieve is directly related to the strength of the type system. For example, Java has a strong type system, but `NullPointerException`s are still possible at runtime.

```java
public class Main {
  public static void main(String[] args) {
    User user = findUser("123"); // returns null if not found
    String name = user.getName(); // compiles fine, but throws NullPointerException at runtime
    System.out.println("Hello " + name);
  }
}
```

TypeScript has a strong type system, but `null/undefined` are still possible at runtime (depending on compiler configuration around `strictNullChecks`).

```typescript
function getUser(id: string): User {
  return db.users.find(u => u.id === id) as User; // as User bypasses null check
}

const user = getUser("123");
console.log(user.name); // compiles fine, but crashes at runtime if user wasn't found
```

If AI writes code now, we should be pick strongly typed languages, for the same reason humans adopted them: we want to guide AI agents to write code correctly the first time. 

### What is the role of the developer?

The proficiency of AI agents at writing code has led to a crisis with many developers as they question their role. What used to occupy a lot of the developer's time (writing code) now takes up much less time. I recently consulted with a non-engineer about their vibe-coded project. It was amazing how quickly an app can be templated. But all the skills around testing, debugging, version control, incremental delivery, and shipping are still in demand. A vibe coder doesn't have the experience to know which technologies would be best for their project such as choice of dev language, REST APIs, databases, frameworks, and the list goes on. There is just too much they're unaware of to maintain a project long-term. 

One aspect of long-term maintenance is establishing good coding patterns that allow AI to extend your codebase with ease. This is a powerful feature of AI-driven development; it can result in compounding gains, or compounding pains. With great patterns established, AI can plan your next feature by examining existing patterns and extending them. But it also means that if the codebase has poor patterns, it is up to the developer to understand this and steer AI down a different path to establish better patterns. 

### Conclusion

Coding is no longer for humans, but don't panic. Your knowledge as a software developer is still very valuable. It has always been the trajectory of the software developer's career to move further away from code and into more abstract concepts; AI has simply made this transition happen earlier in your career. The time we spent coding has now shifted to time spent planning, architecting, delivering, iterating, and collaborating. There is more space for us to hold the higher-level concepts of a project in our brains, while we push the cognitive load onto AI, for better or for worse. I think it's for the better. 

Don't worry about clean code, worry about directing AI towards better patterns. Don't use dynamic languages, your preferences in this area don't matter any longer. Software languages are for AI, and AI doesn't care, so choose type certainty. 