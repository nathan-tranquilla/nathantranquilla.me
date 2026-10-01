---
name: first-draft
description: Take a blog post from idea to first draft with the author (idea blurb, agreed breakdown, then the draft built one paragraph at a time from the author's voice-note dumps), capturing them faithfully without inventing, in the house voice (grade 10 reading level, no em dashes, no AI tells). TRIGGER WHEN: the user pitches a post idea, wants to outline or dictate a post, sends a voice-note dump for a paragraph, or wants to start or continue a draft for `src/pages/blogs/`. For critiquing or editing an existing draft, use `blog-review` instead.
---

# First Draft

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

   **Save it on approval.** Write the approved outline to `docs/<slug>-outline.md`,
   where this repo keeps post outlines: the working title, the approval date, every
   section and paragraph line, and any open questions still to settle. It is the
   reference for the paragraph loop. `docs/` is gitignored, so it is local-only with
   no backup. If the breakdown changes later, update the saved outline and note the
   change and why at the bottom.

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
   - **On approval,** the prose replaces that paragraph's `[ ]` line in the draft file,
     and you prompt for the next one. On a correction, redistill and show it again. A dump that covers two
     paragraphs gets split, and the author is told. If a dump contradicts the agreed
     breakdown, raise it and update the breakdown first.

5. **First draft.** When no `[ ]` lines remain, the file is the author's first draft.
   Say so, and list the loose ends: headings that no longer fit their section, parked
   decisions, and anything that must be true before publishing. What happens next
   (critique, editing, publishing) is `blog-review`.

The draft file is the record of progress, so the process can stop and resume in a
later session from the first unchecked paragraph.

## Principles from practice

The workflow above is the shape. These are the habits that made it work.

- **The breakdown is a living document.** Dumps rarely match the plan. When one covers a
  different point, reorders the post, or makes a planned paragraph redundant, follow the
  author's material: propose the outline change alongside the distilled paragraph, then
  update the saved outline and its change log. Cut a planned paragraph that a dump has
  already covered instead of prompting for it again.
- **A paragraph stays open until the author moves on.** Short dumps that follow a shown
  paragraph are amendments to it (a detail, a tense, an emphasis, a reorder), not new
  paragraphs. Redistill and show the whole paragraph each time. When asked to read
  back, show the approved text clean, without commentary.
- **Fact-check what the post says about the author's own work.** When a paragraph
  describes a real system, check each concrete claim against the source before it is
  approved, report what holds and what does not, and correct the prose to match. The
  post never describes something that does not exist. If the author would rather change
  the system than the prose, that change is made where the system lives, by whoever
  owns it, and the paragraph waits on it.
- **The author may pause drafting to study.** Stop prompting, do the study, report it in
  plain terms, then resume at the same paragraph.
- **Examples are made up, and they work.** Snippets and example files use invented
  names, and are run or validated before they go into the draft.
- **Ideas, not the author's private details.** The repo and the post are public.
  Default to the idea over the author's own figures, institutions, and people unless
  the author asks for them.
- **Guard the whole post, not just the paragraph.** Watch for a point made twice, a
  number that disagrees between paragraphs, and an opening without a hook. Raise them as
  they appear.
- **Undecided items are parked, not guessed.** When the author moves on without
  deciding, record the open question in the saved outline and settle it at its paragraph
  or at the end.
- **Ideas bigger than the post are saved, not drafted.** A product, a follow-up post, or
  a change to another project goes into memory or its own plan, and the post states only
  what is true today.

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

- **The words are the author's; the punctuation is yours.** Everything arrives by voice,
  so even text the author gives as final wording has speech-to-text punctuation. Keep
  their words, and punctuate and capitalize to house style without asking.
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
