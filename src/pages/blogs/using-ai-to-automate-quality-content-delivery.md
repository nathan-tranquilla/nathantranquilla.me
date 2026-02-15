---
layout: ../../layouts/Blog.astro
title: How I Classified 60,000+ Office Quotes With AI
author: Nathan Tranquilla
date: "2026/02/16"
tags: ["AI","Prompt Engineering","Automation"]
---

I run [The Office Lines](https://theofficelines.com), a site that lets you search all The Office (US) lines by keyword. I wanted to add a quotes section, divided by topic: love, friendship, work, sarcasm, you get it. The challenge was classifying 60,000+ lines of dialogue by topic, in context, so that I could automatically generate high-quality quote pages. This is the problem I solved with Claude.

### The Problem And The Payout

So how do you classify 60,000 lines? There are three ways I know of. I can read the script and add 5-10 labels manually. I can search all the lines for keywords and label matches that way. Or I can use AI. The first seems laborious, the second seems naive, and the third, as I'll explain, adds in a little judgement, even if the judgement is artificial. If I can confidently label a line as funny, sarcastic, savage, or about love, family, or work, then an entire year's worth of content can be generated automatically. That's exactly what the AI approach made possible.

### The Approach

The model I chose was `claude-haiku-4-5-20251001`, Claude's fastest and cheapest option. This is a classification task, not a creative one, so speed and cost matter more than raw intelligence.

The key design decision was feeding an entire episode's dialogue into each API call, not individual lines. A line like "That's what she said" means nothing in isolation, but in context you can tell whether it's funny, awkward, or savage. Only lines longer than 30 characters were sent as candidates for classification, as shorter lines rarely carry enough meaning to categorize.

### Prompt Engineering

The prompt asks Claude to return raw JSON mapping each quote ID to topics with confidence scores from 5 to 10:

```json
{
  "01_01_0": { "about-work": 7, "funny": 6 },
  "01_01_5": { "awkward": 9 }
}
```

This structured output can be parsed and stored directly as an index. But the real work was in making the prompt strict. The system prompt explicitly tells the model:

- Most quotes should match 0-1 topics
- Scores of 8+ are reserved for standout examples
- "Funny" must actually be LOL-worthy, not just mention humor
- "Awkward" must make you cringe, not just be odd
- "Savage" must be a real burn, not just mildly rude

This strictness is why only 35% of the 60,000+ lines ended up classified at all. The rest genuinely don't fit any topic strongly enough, and that's the point.

The confidence scores enable two tiers of content. Quotes scoring 7+ appear on topic browse pages, giving a broader selection. Quotes scoring 8+ appear on curated spotlight pages, where only the best examples make the cut. This means season rollup pages can have a higher bar than episode pages, because the larger pool of data warrants a stricter selection.

### The Results

The whole pipeline ran across 197 episodes in about 60 minutes for roughly $5. That $5 now powers hundreds of content pages being delivered every weekday for the next 14 months. Judge for yourself: here are the [funniest quotes](https://theofficelines.com/quotes/funny), the [most savage burns](https://theofficelines.com/quotes/savage), the [most awkward moments](https://theofficelines.com/quotes/awkward), and quotes about [love](https://theofficelines.com/quotes/about-love), [work](https://theofficelines.com/quotes/about-work), and [friendship](https://theofficelines.com/quotes/about-friendship), all classified and curated by AI.
