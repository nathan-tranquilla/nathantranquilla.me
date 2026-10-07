import { test, expect } from "@playwright/test";
import { postPaths } from "../helpers/posts";

// The domain is the one string that appears in every search result. It was
// misspelled "nathantraquilla.me" on all blog posts for months, so this walks
// every page rather than sampling.
test("every page titles with the domain spelled correctly", async ({ request }) => {
  const paths = [
    "/",
    "/about/",
    "/blogs/",
    "/portfolio/",
    "/consultation/",
    "/guides/",
    ...(await postPaths(request)),
  ];
  expect(paths.length).toBeGreaterThan(15);

  const wrong: string[] = [];
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    // Pages use two orders (headline first on posts and guides, domain first
    // elsewhere). What matters here is that the domain is spelled right.
    const ok = title.includes("nathantranquilla.me") && !title.includes("nathantraquilla");
    if (!ok) wrong.push(`${path} -> ${title}`);
  }
  expect(wrong).toEqual([]);
});

test("the homepage title says what the site is about", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  expect(title).not.toMatch(/theology|books/i);
  expect(title).toMatch(/type safety/i);
});

// Google shows about 60 characters of a title. With the domain first, a
// post's search result showed the domain and half the headline, and the words
// a searcher typed were the ones cut off. The headline leads; the domain trails.
test("every post title leads with its headline and ends with the domain", async ({ request }) => {
  const paths = await postPaths(request);
  expect(paths.length).toBeGreaterThan(10);

  const wrong: string[] = [];
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, "").trim() ?? "";
    if (title !== `${h1} | nathantranquilla.me`) wrong.push(`${path} -> ${title}`);
  }
  expect(wrong).toEqual([]);
});
