---
layout: ../../layouts/Blog.astro
title: Why ReScript is Next Gen
author: Nathan Tranquilla
date: "2025/10/13"
tags: ["ReScript"]
---

Programming languages evolve by fixing problems from the past while maintaining familiarity. The evolution of a language often reveals the problems humans face when using it and how they propose to solve them.

Consider TypeScript as an example. TypeScript can be viewed as an expression of desire on behalf of JavaScript developers to have more safety in their development experience and fewer surprises in production.

A longer trend in JavaScript's history has been the addition of functional features. Think Lodash, Underscore, and even React. These functional paradigms express developers' desire for code that can be reasoned about more easily within a sane framework, solving the problem of individualized spaghetti code. Before React, there was jQuery, then Backbone along with other small frameworks—this was the norm. It wasn't functional, it was brittle, and it lacked any real framework to guide development.

Sometimes, between each generation of languages, you need an intermediary step that makes the transition palatable for developers. That's how I view TypeScript. Most JavaScript developers are now familiar with strong-ish type systems thanks to TypeScript, and that familiarity will make the next generation of languages much easier to adopt. We can thank TypeScript for acting as a bridge between JavaScript and the language that truly fixes its problems: ReScript.

### ReScript

ReScript is a _**Next Gen Web Dev**_ language. It fixes the problems of the past while feeling familiar to JavaScript and TypeScript developers. Where TypeScript, with its compromises, fails to bring safety to JavaScript, ReScript succeeds. Its type system is strong and completes what TypeScript lacks, yet it remains familiar with strong type inference and excellent React support. 

There are four principles that define _*Next Gen Web Dev*_ languages:

* **Strong Type System**: Enables web development to deliver robust applications with confidence
* **Language Heritage**: Maintains a strong connection to the past while addressing familiar concerns
* **Framework Readiness**: Sufficient to address the present complexity of web development
* **Incremental Adoption**: Can be adopted incrementally to minimize risk while moving toward the future

ReScript satisfies each of these principles:

* **Fixes gaps in TypeScript's type system** - If you'd like to read about this in detail, see [5 Ways ReScript Fixes TypeScript](/blogs/5-ways-rescript-fixes-typescript)
* **Feels like JavaScript and TypeScript** - It has excellent type inference, which makes it feel like vanilla JavaScript. ReScript continues JavaScript's functional paradigm and improves upon it. The `Belt` utility library provides functional tools, while treating constructs like `if` and `switch` as expressions rather than statements creates more predictable code flow.
* **Fully supports modern React** - Complete support for [React versions (>= v18.0)](https://rescript-lang.org/docs/react/latest/introduction)
* **Enables depth-first adoption** - Unlike TypeScript's breadth-first approach, ReScript can be incorporated incrementally. You can try it out by writing vanilla ReScript code for core functions, utilities, or state management (like Redux), or by writing React components and incorporating them one by one 

Among _*Next Gen Web Dev*_ candidates for client-side development, no other contender scores well across all four of these principles like ReScript does. 

---

**Ready to embrace _Next Gen Web Dev_ delopment in your projects?** Whether you're starting fresh or upgrading an existing project to align with the future of web development, my ReScript expertise can guide your transition. <a href="/services" target="_blank" rel="noopener noreferrer">Schedule a consultation to explore how ReScript can transform your development experience →</a>
