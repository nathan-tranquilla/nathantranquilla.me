---
name: tag-curation
description: Audit and curate the blog's post tags. Checks every one- and two-tag filter on /blogs against what each post is actually about, proposes retags, and looks for new tags the posts are asking for (and tags that have stopped earning their place). TRIGGER WHEN: publishing a post, changing the tag set in `src/utils/tags.ts`, or asked to review, audit or rethink tags.
---

# Tag Curation

Tags exist for one job: the filter on `/blogs`. A reader picks one tag, or
two (posts with both), and should get exactly the posts that are about that.
A tag is right when the filter it drives returns what a reader expects.

## The tags and what they mean

Write each meaning narrowly. A broad tag stops narrowing anything. When a
meaning changes, change it here first, then retag.

| Tag | A post carries it when… |
|---|---|
| AI | AI is a central subject, not a passing tool mention. |
| Coding | It is about how software gets written day to day: the practice, workflow, review and ownership of code. Not every post about a language. |
| Automation | Software does a job a person used to do, as a pipeline or an agent: the post is about building or running that. |
| Type Safety | Type systems, static types or type soundness are a main thread of the argument. |
| ReScript | ReScript is a subject, not one example among others. |
| Finance | Money: personal or business finances, budgeting, accounting. |

The list itself lives in `src/utils/tags.ts` (`TAGS`). `tags.spec.ts` holds
every post to that list, with one to three tags each.

## Method

1. **Read the posts.** Every published post in `src/pages/blogs/` (skip
   `draft: true`): title, description, tags, and the body. Count how often
   each subject comes up, then read the borderline cases in context. A
   count says where to look, not what the answer is: one mention in
   passing is not a subject.
2. **Decide what each post should carry**, against the meanings above.
3. **Compare every filter.** For each single tag and each pair, list the
   posts that should show and the posts that do, and mark what is missing
   or extra. Note pairs that return nothing: the page shows an empty state
   for them.
4. **Look for new tags.** See below.
5. **Look for tags to drop or merge.** See below.
6. **Check the phone layout** if any post would go to three tags: the
   header's tag row must stay on one line (`ui-post.spec.ts`), and a long
   three-tag set can still fail it.

## Finding new tags

A subject earns a new tag when all of these hold:

- **Two or more posts** are about it, by the meanings standard above. A
  tag on one post never narrows the list. (Finance is the exception that
  shows the cost: one post, kept because the author writes about money.)
- **No existing tag covers it.** If one nearly does, consider widening that
  tag's meaning instead, and say so.
- **It pairs usefully.** Selecting it with an existing tag returns
  something, or it is a subject a reader would arrive looking for.
- **It fits the site.** The site is personal, not web-dev only: theology
  and book reviews belong here too. A new subject area the author has
  started writing about is a strong candidate even at two posts.

Look for it in what the posts share that the tags do not say: the same
argument made twice (the developer's role in an AI world, say), a recurring
kind of post (benchmarks, project write-ups, reviews), or a subject outside
software. Name the posts that would carry it.

## Dropping or merging tags

- A tag on **most posts** has stopped filtering. Say how many, and whether
  splitting it would help.
- Two tags that **always appear together** are one tag. Say whether to
  merge them.
- A tag with **no posts left** goes.

## Reporting

Report in plain words, with full post titles: never codes or abbreviations.
The author reads the result to decide, so lead with the decisions.

1. The concrete changes, one per post: the title, the tag added or removed,
   the tags it ends with, and a one-line reason.
2. Any new tag proposed, with the posts that would carry it and why.
3. Any tag to drop or merge.
4. What changes on `/blogs` as a result: which filters gain or lose posts,
   which empty pairs fill.
5. The judgement calls left alone, briefly, so the author can overrule them.

Keep the full filter-by-filter table out of the report unless asked for it.

## Applying

Propose first; change nothing until the author approves.

- **A retag** is a content edit to the post's `tags:` frontmatter. Run the
  full suite: the filter specs read tags from the post files, but some
  specs name a sample post's tags directly and need updating with it.
- **A new or removed tag** changes `TAGS` in `src/utils/tags.ts`, which
  changes the filter row on `/blogs`. That is a design change: capture it as
  an Intent and gate it before editing.
- Commit retags as `content(blog): …`, listing each post, the change and
  the reason in the body.
