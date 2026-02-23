---
layout: ../../layouts/Blog.astro
title: "When Two AI Pipelines Meet: Turning Curated Data Into a Daily API"
author: Nathan Tranquilla
date: "2026/02/23"
tags: ["AI","Prompt Engineering", "Automation", "API"]
---

I maintain a simple [quote of the day API](https://theofficelines.com/api/) for fans of The Office (US). It returns a quote, a correlated YouTube clip, and it's SFW. Sounds simple, but there are actually tough problems to solve for this to work without human curation. How did I qualify the pool of quotes? How did I correlate quotes to YouTube scenes? How do I cycle it once a day? And how can I afford to make this free to use?


<figure>
  <div style="display: flex; justify-content: center">
  <!-- Safe-for-work quotes only -->
  <div data-office-qotd="sfw"></div>

  <script src="https://theofficelines.com/embed-qotd.js" async></script>
  </div>
  <figcaption>Today's quote of the day, served from a static JSON file with no backend</figcaption>
</figure>

### Qualifying The Pool

There are over 60,000 lines from The Office (US). Most of them are uninteresting and not shareable. I had to find a way of classifying each line of The Office by a set of topics. Lines that are funny, for example, would get the topic "funny". This task is impossible for a human to do in a reasonable time frame, and a keyword search of all the lines is a naive approach. I needed a little judgement as part of my workflow, and I felt AI was up to the task.

Here was my thought process:
1. AI must be integrated programmatically into my workflow. Chat boxes would not allow the process to scale. I chose Claude, specifically its `Haiku 4.5` model. It's cheap, fast, and adequate for topic classification.
2. I had to feed an entire episode of dialog into the model so it could understand the context of each line.
3. I had to engineer a prompt that defines the topics and what they mean.
4. The prompt had to define the confidence scale, and what to do with low-confidence classifications (discard them). For example, defining the criteria for each confidence score (see figure below).
5. The prompt had to define the structure of the data the model would return.

<figure>

```
Rules:
- Only include matches with confidence 5 or above. Omit weak matches entirely.
- Be STRICT. Most quotes should match 0-1 topics. A score of 8+ should be reserved for standout examples.
- For "funny": the quote must actually be funny/comedic, not just mention humor. A 9-10 means laugh-out-loud.
```

<figcaption>A snippet of the prompt defining what confidence scores mean and when to discard</figcaption>
</figure>

<figure>
```
"03_15_3": {
  "funny": 7,
  "sad": 5,
  "about-absurdity": 6,
  "sfw": 10
},
```

<figcaption><a href="https://theofficelines.com/quote/03_15_3" target="_blank">A line</a> classified across four topics, with SFW scoring a perfect 10</figcaption>
</figure>

The initial classification of a dozen or so topics cost me about $5 in token usage. I thought this was a very good price for the quantity processed, and the quality of the results.

Most lines were not classifiable at all and were discarded. Lines with a confidence score `>=5` were kept. Very few lines were classified with a score of `10`. This gave me an incredible set to work with.

The results were very good. I'm currently using them to generate a content schedule for [theofficelines.com](https://theofficelines.com), and am satisfied with the quality as an actual user of the site.

### Correlating The Lines With Scenes On YouTube

The second challenge to solve was correlating lines to scenes on the official YouTube channel. Having solved the previous problem with AI, I saw immediately how this problem was similar. Here was my thought process:

1. Feed an AI agent the line with 10 lines of surrounding context. The agent formulates a query for the YouTube search API that is likely to locate this scene. The context is perhaps more important than the given line itself. See figure below for the guidelines.
2. Submit the agent's query to the YouTube API client and get results.
3. A second AI agent curates the results and picks the clip that matches best. If there are no good matches, discard. I also asked this agent to provide a reason for its selection. See figure below.

<figure>

```
Rules:
- Always start with "The Office"
- Include character name and a distinctive phrase from the scene
- Focus on what makes this specific scene memorable and searchable
- Avoid generic terms that would match compilations (e.g., "best moments", "funniest", "top 10")
- Keep queries under 10 words
- Return ONLY the search query string, nothing else. No quotes, no explanation.
```

<figcaption>Agent 1: Snippet of prompt. Craft a YouTube search query from the surrounding dialog</figcaption>
</figure>

<figure>

```
Be STRICT with confidence scoring:
- 9-10: Video title clearly references this exact scene or quote AND is a single scene clip
- 8: Video title matches the episode/moment but not the exact line, still a single scene
- 5-7: Loosely related, uncertain match, or only tangentially connected
- 1-4: Wrong scene, generic compilation, montage, "best of", or multi-scene video — ALWAYS reject these

```

<figcaption>Agent 2: Snippet of prompt. Curate YouTube results and score confidence on the match</figcaption>
</figure>

<figure>

```
"03_15_3": {
  "videoId": "hzw1P_uGFys",
  "videoTitle": "Life Lessons for Michael's Future Son  - The Office US",
  "channelTitle": "The Office",
  "confidence": 9,
  "reason": "Video title directly references 'Life Lessons for Michael's Future Son' which matches the scene of Michael recording a video with life advice for his son, including the 'dealio' quote. This is a single scene clip from Season 3, Episode 15."
},
```

<figcaption>A high-confidence match from the curation pipeline, with the AI's reasoning for its selection. <a href="https://theofficelines.com/quote/03_15_3" target="_blank">See the quote</a></figcaption>
</figure>

I'm currently rate limited by the YouTube API at about 100 correlations per day, which costs about $0.18 in token usage. At this rate, I estimate it will take about 5 months and $27–$36 to correlate all 15-20k lines of interest. The correlation process prioritizes quotes with interactions first, such as likes and shares. If you'd like to see a video correlated with your favorite quote, just go over to [theofficelines.com](https://theofficelines.com) and like or share your favorite quotes; they'll be correlated sooner!

### Why It's Free To Use
The API is free because it's just a static JSON file.

<figure>

```
GET https://theofficelines.com/data/qotd.json
GET https://theofficelines.com/data/qotd-sfw.json
```

<figcaption>The two available endpoints, served as static files from a CDN</figcaption>
</figure>

Given that these files are static, and hosted on a CDN, I can provide it for free and spread the enjoyment of The Office to all! This was such an elegantly simple solution. Most API endpoints require a backend with databases, API keys, and rate limiting. With this solution, it's free and static, and can be cycled daily through a CI schedule. This leaves us with the last problem of cycling the quotes deterministically.

**Note**: _If you need a SFW-only widget, be sure to use the `qotd-sfw.json` endpoint._

### Cycling the API Once A Day
[theofficelines.com](https://theofficelines.com) is still under construction, going through multiple builds a day. I can't simply cycle the API on each build; the selection had to be deterministic, based on the date. This is where AI suggested I use a `djb2` hash-based approach. Here is the relevant code.

<figure>

```
// djb2 hash — deterministic, good distribution
// hash = hash * 33 + char
let hashDate = (dateStr: string): int => {
  let hash = ref(5381)
  for i in 0 to String.length(dateStr) - 1 {
    let char = String.charCodeAt(dateStr, i)->Option.getOr(0)
    hash := hash.contents * 33 + char
  }
  Int.bitwiseAnd(hash.contents, 0x7FFFFFFF)
}

// Select a quote index from the clip pool for a given date
let selectIndex = (dateStr: string, poolSize: int): int =>
  mod(hashDate(dateStr), poolSize)
```

<figcaption>Deterministic daily selection in ReScript — same date always picks the same quote</figcaption>
</figure>

### Conclusion
Even a simple widget can hide a lot of complexity. Two AI-powered pipelines came together to provide an experience for The Office fans that is not currently available anywhere else, at least that I am aware of. Hosting the data on a CDN makes it free and accessible to all, while the embed widget makes it simple to add to your site. If you would like to either embed the widget in your site, or access the API to build your own widget, you can find the details [here](https://theofficelines.com/api/). I've also created a WordPress plugin for this, though it is currently under review.