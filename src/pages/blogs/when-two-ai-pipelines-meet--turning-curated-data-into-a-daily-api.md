---
layout: ../../layouts/Blog.astro
title: "When Two AI Pipelines Meet: Turning Curated Data Into a Daily API"
author: Nathan Tranquilla
date: "2026/02/24"
tags: ["AI","Prompt Engineering", "Automation", "API"]
draft: true
---

I maintain a simple quote of the day API for fans of The Office (US). It returns a quote, a correlated YouTube clip, and it's SFW. Sounds simple, but there are actually tough problems to solve for this to work without human curation. How did I qualify the pool of quotes? How did I correlate quotes to YouTube scenes? How do I cycle it once a day? And how can I afford to make this free to use?


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

The results were very good. Most lines were not classifiable at all and were discarded. Lines with a confidence score `>=5` were kept. Very few lines were classified with a score of `10`. This gave me an incredible set to work with.

I think the initial classification of a dozen or so topics cost me about $5 in token usage. I thought this was a very good price for the quantity processed, and the quality of the results.

### Correlating The Lines With Scenes On YouTube
The second challenge to solve was correlating the scenes on the office YouTube channel for The Office. Having solved the previous problem with AI, I saw immediately how this was a job that AI could do well. My thoughts on the pipeline for the curation process were as follows:

1. Feed an AI agent the line with 10 lines of surrounding context. Get the AI agent to formulate a query for the YouTube search API that is likely to locate this scene. To locate the scene, the context is perhaps more important than the given line itself. 
2. Submit the agent's query to the YouTube API client and get results. 
3. Get another AI agent to curate the results and pick the clip that matches best. If there are no good matches, then discard. A similar approach with confidence scores is used here, and we also asked the curator agent to provide a reason for the choice of selection.

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


I'm currently rate limited by the YouTube API at about 100 correlations per day. At this rate, I estimate it will take me about 5 months to correlate all lines of interest (about 15-20k lines). The correlation process prioritizes quotes with interactions first, such as likes and shares. If you'd like to see a video correlated with your favorite quote, just go over to https://theofficelines.com and like and shared your favorite quotes; they'll be bumped up in priority!

### Cylcling The API Once A Day
The API is free because it's just a static json file
```
GET https://theofficelines.com/data/qotd.json
GET https://theofficelines.com/data/qotd-sfw.json
```
Given that this is hosted in a CDN, there is no cost to me so I can provide it for free and spread the enjoyment of The Office to all!

**Note**: _If it is important for you to embed a SFW widget, be sure to use the `qots-sfw.json` endpoint._

### Cycling the API Once A Day
[theofficelines.com](https://theofficelines.com) is still under construction going through multiple builds a day. I can't simply cycle the API on each build, the algorithm needed some more determinism based on the date. This is where AI suggested I use deterministic hash-based approach using the `djb2` algorithm. Here is the relevant code.

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
This was such a fun project for me! Even a simple widget can hide a lot of complexity, but I am happy to share it with all fans. If you would like to either embed the widget in your site, or access the API to build your own widget, you can find the detail [here](https://theofficelines.com/api/). I have created a WordPress plugin for this as well, though it is currently under review. 