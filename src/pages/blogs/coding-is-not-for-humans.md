---
layout: ../../layouts/Blog.astro
title: "Coding Is Not For Humans"
author: Nathan Tranquilla
date: "2026/03/19"
tags: ["AI","Coding"]
---

Coding is no longer a human task. At my day job, AI agents write the majority of code. In my personal projects, I no longer write code at all. If coding belongs to AI now, do the human-centric battles around code still matter: clean code patterns or dynamic vs static type systems? What is the role of the human?


### No One Cares About Clean Code (Anymore)

Clean code is a pattern of writing code that makes it easy for other humans to reason about. It is a style of writing that facilitates human collaboration across projects and across time. A great example of a clean code practice is the `early return` in which exit conditions are placed early in the code block. 

<figure>
<figcaption>Before</figcaption>

```javascript
function processOrder(user, cart, promo) {
  if (user) {
    if (user.isActive) {
      if (cart && cart.items.length > 0) {
        if (!cart.items.some(i => i.outOfStock)) {
          if (promo) {
            if (promo.isValid && promo.expiresAt > Date.now()) {
              const discount = promo.amount;
              return checkout(cart, discount);
            } else {
              return { error: "Invalid promo" };
            }
          } else {
            return checkout(cart, 0);
          }
        } else {
          return { error: "Item out of stock" };
        }
      } else {
        return { error: "Cart is empty" };
      }
    } else {
      return { error: "Account inactive" };
    }
  } else {
    return { error: "No user" };
  }
}
```

</figure>

<figure>
<figcaption>After</figcaption>

```javascript
function processOrder(user, cart, promo) {
  if (!user)                                return { error: "No user" };
  if (!user.isActive)                       return { error: "Account inactive" };
  if (!cart || cart.items.length === 0)     return { error: "Cart is empty" };
  if (cart.items.some(i => i.outOfStock))   return { error: "Item out of stock" };

  if (!promo) return checkout(cart, 0);

  if (!promo.isValid || promo.expiresAt <= Date.now()) {
    return { error: "Invalid promo" };
  }

  return checkout(cart, promo.amount);
}
```

</figure>

The first is difficult for humans to parse because it requires a human to cognitively hold multiple conditions at once, while the "happy path" is buried in nested conditions. The second is simpler for humans to parse because it does not overload the human cognition; instead it reads more like a checklist, which humans can read and mentally offload immediately. 

But it doesn't matter anymore because AI reads and writes its own code now, and it's generally good at writing code with good practices. There is one caveat to this, "pattern extension," which I will get to later. 

### Human-centric battles of coding disappear... 

Given that coding will be a predominantly AI-driven task, does the battle over dynamic vs statically typed languages matter? At its core, this has been a battle of human preferences over the art of coding. Dynamic languages let you move faster, but often come with less certainty on the operation of types before the product is shipped, resulting in more bugs. Static typing imposes more rigidity at development time, which is an added burden to developers, but type operations are guaranteed, meaning fewer runtime errors. 

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

TypeScript has a strong type system, but `null/undefined` are still possible at runtime (depending on compiler configuration).

```typescript
function getUser(id: string): User {
  return db.users.find(u => u.id === id) as User; // as User bypasses null check
}

const user = getUser("123");
console.log(user.name); // compiles fine, but crashes at runtime if user wasn't found
```

Static type systems have been resisted by many because they impose a rigid structure over a fluid artform. But art matters to humans, it doesn't matter to AI agents. What static type systems have always done is give early feedback on whether the type operations are correct, as opposed to waiting for runtime edge cases (like in production) to reveal errors. Dynamically typed languages are easy for humans to read, and enjoyable, but that doesn't matter anymore. AI writes code now, and so we should be picking strongly typed languages for AI. Why? For the same reason as humans; we want to guide AI agents to write code not only speedily, but correctly... the first time. 

### What is the role of the developer?

The proficiency of AI agents at writing code has led to a crisis with many developers as they question their role. What used to occupy a lot of the developer's time (writing code) now takes up much less time. I recently consulted with a non-engineer about their vibe-coded project. It was amazing how quickly an app can be templated. But all the skills around testing, debugging, incremental delivery, version control, and shipping are still in demand. A vibe coder doesn't have the experience to know which technologies would be best for their project such as choice of language, REST APIs, databases, frameworks, and the list goes on. A vibe coder cannot steer a project from poor patterns to better ones. This has led me to believe that the fundamental software development skills are needed, now more than ever. 

Earlier I mentioned that clean code doesn't matter, but with one caveat, and that is pattern extension. What I have noticed is that AI is great at understanding, and extending the current pattern in your codebase. This is a powerful feature of AI-driven development; it can result in compounding gains, or compounding pains. With great patterns established, AI can plan your next feature by examining the existing patterns in your codebase and creating new features based on them. But it also means that if the codebase has poor patterns, it is up to the developer to understand this and steer AI down a different path to establish better patterns. 

### Conclusion

Coding is no longer for humans, but don't panic. Your knowledge as a software developer is still very valuable. It has always been the trajectory of the software developer's career to move further away from code and into more abstract concepts; AI has simply made this transition happen earlier in your career. The time we spent coding has now shifted to time spent planning, architecting, delivering, iterating, and collaborating. There is more space for us to hold the higher-level concepts of a project in our brains, while we push the cognitive load onto AI, for better or for worse. I think it's for the better. 

Don't worry about clean code, worry about directing AI towards better patterns. Don't use dynamic languages, your preferences in this area don't matter any longer. Software languages are for AI, and AI doesn't care, so choose type certainty. 