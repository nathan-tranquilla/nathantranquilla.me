---
layout: ../../layouts/Blog.astro
title: Teach Claude Your Project Once, Benefit Forever
author: Nathan Tranquilla
date: "2026/04/07"
tags: ["Claude"]
---

Claude is great, but after a while it _should_ know things about your project. Those lessons never stick. That's the gap Claude skills fill. If you're using Claude Code but haven't started writing skills yet, this post is for you. What is a Claude skill? What gaps does it fill? How do you write them? And how can you use them to further accelerate your development?

### What Is a Claude Skill?

Claude skills give Claude Code project-specific knowledge: your conventions, workflows, architecture, and so on. Claude Code is already capable at software development in general, but it doesn't know the particulars of your codebase. Skills bridge that gap. Without them, you'll hit pain points where Claude does things the "right" way in general but the wrong way for your project. 

Think of it this way. You're a software developer of many years. You bring all those years of experience to your next job. But you still have to onboard, learn about the project, and adapt to its workflows. These are skills you acquire, and in the same way, skills are what help Claude onboard too.

### Where I Felt the Pain

Here are two places where I felt the pain before adding skills.

Take making commit messages with Claude in a project with pre-commit hooks. Pre-commit hooks often exist to enforce Conventional Commits or commit length, or to run lint tasks. Getting Claude to commit makes a lot of sense because Claude writes good messages, but it doesn't know your project's constraints. Time is wasted when Claude makes an invalid commit. A minute or two goes by before the validation fails:

- The commit message was too long
- The title was invalid
- Linting was required beforehand 

This is when I realized I needed to add a skill to help Claude understand how to make a commit message correctly the first time. For my particular project, the codebase must be free of linting errors, the commit message body must be no longer than 70 characters, and the title must include the ticket. So I instructed Claude to make a skill that encapsulates this knowledge. 

Here is another pain point. As a web developer who maintains a site, SEO is important to me. But Claude doesn't understand what I value when building a web page. Do I prefer SSR pages or client apps? HTML standards or defaulting to divs and spans? Google on-page SEO hygiene or just building something that looks nice? Asking Claude to add a new page or feature often doesn't result in these standards being met. You ask it to build a new page, but it has multiple `<h1>` tags, or fails to use `<article>`. This is a gap that Claude skills can fill. 

### How Do You Write Them?

Writing Claude skills is simple. They reside in `.claude/skills/<folder-name>/SKILL.md` files. There is no set format for writing a skill, but from experience, I've noticed some conventions help Claude recognize when a skill or set of skills should be used.

1. Use `TRIGGER WHEN:` terminology in the skill itself. This helps Claude understand under what conditions the skill should be loaded. You'll know a skill is loaded because Claude Code will give that feedback in the console. For example, `TRIGGER WHEN: writing a commit message` would be an effective trigger for a `git-conventions/SKILL.md`.
2. Reference documentation from the skill to fully inform Claude. For example, link to your project's commit conventions or testing standards. I like to keep my skills light on documentation and more focused on tasks or steps.
3. Have a related skills table at the bottom. This is helpful for building a web of knowledge that Claude can leverage. If it identifies a skill, it will also see related skills and determine if those are needed as well. Some tasks pull in many skills.

Here's what a real skill file looks like for the commit example from earlier:

```
# Git Commit Conventions

TRIGGER WHEN: writing a commit message

## Rules
- Run linting before committing
- Commit message body must be no longer than 70 characters
- Title must include the ticket number (e.g. PROJ-123)
- Follow Conventional Commits format (feat, fix, chore, etc.)

## Related Skills

| Skill | When to use |
|-------|-------------|
| code-conventions | When writing or modifying code |
```

### How Can Skills Accelerate Your Development?

This skill-building activity has a compounding benefit. As you add skills, Claude builds a web of knowledge that is specific to your project and becomes more proficient at tasks. This saves you time in a few ways:

1. Claude spends less time researching the codebase to understand the problem, as a lot of that research is already encapsulated in the related skill and accompanying docs.
2. Prompts require less input, as the supporting context for a task is derived from skills and linked documentation.
3. Mistakes drop off. Claude stops making the same project-specific errors once those patterns are captured in skills.
4. With enough skills, you can start to use more autonomous agents like GitHub Actions, and have the confidence that the task will be done right. 

Claude skills have enabled me to maintain my side projects easily. Commits succeed on the first try. New pages ship with proper SEO. Tests get written without me spelling out every convention. A few sentences in a prompt, and Claude handles the rest.