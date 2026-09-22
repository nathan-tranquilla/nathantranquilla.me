---
name: write-blog-post
description: Draft a blog post from the author's dictated thoughts, capturing them faithfully without inventing, and applying the house voice (grade 10 reading level, no em dashes, no AI tells). TRIGGER WHEN: the user wants to start, dictate, or draft a new post in `src/pages/blogs/`. For critiquing or editing an existing draft, use `blog-review` instead.
---

# Writing a Blog Post

This skill is for getting a post *written*. `blog-review` is for making an existing
draft better. They compose: draft here, critique there, ship with that skill's
pre-publish checklist.

## Voice

**Grade 10 reading level.** Short, clear sentences. Common words over fancy ones.
Jargon only where the audience expects it.

**Never use em dashes.** They read as a tell that a machine wrote the text. Use a
period, a colon, a semicolon, or restructure the sentence. Semicolons are fine.

**Avoid paired antithesis constructions.** "It's not this, it's that." "Not a
critique, a field report." Stacked, these are the clearest signal of AI-written
prose, and they multiply without anyone deciding to use them.

The carve-out: the construction is legitimate when the contrast *is* the argument.
"The problem doesn't lie in who is writing it. The problem lies in your ability to
prove that it's correct" is the thesis of a post, and the negation is load-bearing.
Cut the ones that exist for rhythm; cut any negation restating something the previous
sentence already established. If a paragraph reads fine with the negative clause
deleted, delete it.

**Never three beats.** Statement, then what it is not, then the statement again, is
the specific pattern to watch for. One contrast per idea at most.

**No emojis.** Short paragraphs, three to five sentences.

## Capturing dictation

Posts here get dictated, often across many messages, often mid-thought. The job is
stenography with judgement, not co-authorship.

- **Never invent a fact, a number, a name, or a feeling.** If the author did not say
  it, it does not go in the draft. An honest gap is better than a plausible filler.
- **Stop where the speaker stopped.** Do not finish their sentence. If they trail
  off, write what they said and leave the thread open.
- **Flag transcription guesses; do not silently resolve them.** Speech to text garbles
  names and terms. Write the likely reading, say that you guessed, and let them
  confirm. Getting an author's own source wrong in their byline is worse than asking.
- **Drop what they reject.** If they abandon an example mid-sentence, it does not
  appear in the draft.
- **Numbers get verified before they are written as fact.** "About six months" and
  "one month" are different claims, and the wrong one in a byline is a false statement.

## While drafting

Surface structural problems as they appear, rather than saving them for the end:

- A claim the post has promised and not paid off.
- Two paragraphs landing on the same point.
- A thesis stated so late that the reader waits for it.
- An objection a reader will raise that the post has not met.
- An admission that weakens the argument, so the author can decide whether to own it.

Do not restructure the post until asked. The author is thinking out loud; reordering
under them loses the thread.

## Restructuring into a draft

When asked for a draft, reorder and section, but add no new arguments. Headings are
`###`, title case, and they are the writer's material to approve. State plainly what
was moved and why.

Link to related posts on this site where the text already gestures at one; the SEO
specs check that posts link to other posts.

## Frontmatter

```
---
layout: ../../layouts/Blog.astro
title: <Title Case, matching the filename slug>
author: Nathan Tranquilla
date: "YYYY/MM/DD"
tags: ["Tag"]
draft: true
---
```

**`draft: true` does not keep a post private.** The file is still a route; Astro
builds the page and the sitemap lists it. An unfinished post must stay untracked, out
of any commit, until it is ready to be published.
