---
name: write-blog-post
description: Write a blog post with the author in three stages (idea, agreed outline, then a first draft built one paragraph at a time from the author's voice-note dumps), capturing them faithfully without inventing, in the house voice (grade 10 reading level, no em dashes, no AI tells). TRIGGER WHEN: the user pitches a post idea, wants to outline or dictate a post, sends a voice-note dump for a paragraph, or wants to start or continue a draft for `src/pages/blogs/`. For critiquing or editing an existing draft, use `blog-review` instead.
---

# Writing a Blog Post

This skill is for getting a post *written*. `blog-review` is for making an existing
draft better. They compose: draft here, critique there, ship with that skill's
pre-publish checklist.

## The workflow

This is how every new post is written, up to the first draft. Do not skip ahead.

1. **Ask for the idea.** When the author says they want to write a new post, in any
   wording, ask for the idea as a whole: a first blurb of what the post is about. It
   usually arrives as a long voice-note dump. If they point at source material (a
   sibling repo, an earlier post), study it before going on.

2. **Suggest a breakdown.** Propose the post's structure: numbered sections, and under
   each the **paragraphs**, one line per paragraph saying what it covers. Mention
   anything the idea seems to be missing (the thesis, a reader's objection,
   limitations, a way for readers to start, links to earlier posts on the same theme),
   as suggestions, not additions.

3. **Collaborate on the breakdown** until the author agrees what goes in each
   paragraph and in what order. Print the full breakdown each time it changes. The
   author approves it explicitly before any prose is written.

4. **Go paragraph by paragraph.** Create `drafts/<slug>.md` (untracked until the author
   says to commit; see Frontmatter) with the frontmatter, the section headings, and one
   `[ ]` line per agreed paragraph. Then, for each paragraph in order:

   - **Prompt** for it: name its section and number, restate what it covers, and offer
     two or three short cues that help the author start talking. Cues open doors; they
     never supply content.
   - **The author replies with a data dump,** usually a voice note: long, spoken, and
     out of order. That is the point; it captures the raw idea.
   - **Distill** the dump into the paragraph (three to five sentences) in the house
     voice, using only what the author said (see Capturing dictation). Show it, and
     list briefly what was left out, any transcription guesses, and anything that
     belongs in a later paragraph (park that as a note under that paragraph).
   - **On approval,** write it into the draft file, mark it `[x]`, and prompt for the
     next one. On a correction, redistill and show it again. A dump that covers two
     paragraphs gets split, and the author is told. If a dump contradicts the agreed
     breakdown, raise it and update the breakdown first.

5. **First draft.** When every paragraph is checked, the file is the author's first
   draft. Say so. What happens next (critique, editing, publishing) is `blog-review`.

The draft file is the record of progress, so the process can stop and resume in a
later session from the first unchecked paragraph.

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
hash: "<6 random lowercase letters or digits>"
author: Nathan Tranquilla
date: "YYYY/MM/DD"
tags: ["Tag"]
draft: true
---
```

**Generate a fresh `hash` for every new post and never change it afterwards.** It is
the post's permanent share ID: GA4 share events key on it, and it is the post's short
link (`nathantranquilla.me/<hash>`), so changing it breaks every link already shared. Generate it randomly (for example
`python3 -c "import secrets,string;print(''.join(secrets.choice(string.ascii_lowercase+string.digits) for _ in range(6)))"`),
not from the title or slug, and check no existing post uses it:
`grep -r '^hash: "<value>"' src/pages/blogs drafts`. The `post-hash` spec fails the
suite if a post is missing one or shares one, and `short-links` fails it if the hash
matches a top-level route (e.g. `guides`).

**`draft: true` does not keep a post private.** A file under `src/pages/blogs/` is a
route; Astro builds the page and the sitemap lists it. Unfinished posts live in
`drafts/`, which is not a route. The repo is public, so a draft stays untracked until
the author says to commit it; publishing means moving the file into `src/pages/blogs/`.
