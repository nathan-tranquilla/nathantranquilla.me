import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { postHash, POSTS_DIR } from "../helpers/posts";

// /<hash> is a static redirect page (GitHub Pages cannot redirect on the
// server). The UTM tags on its target are how GA4 credits a visit to a share:
// source "share", medium "link" (which GA4 files under Referral), campaign =
// the post's hash.
const SITE = "https://nathantranquilla.me";

const published = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .filter((f) => !/^draft:\s*true/m.test(fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8")))
  .map((f) => ({ slug: f.replace(/\.md$/, ""), hash: postHash(f)! }));

const target = ({ slug, hash }: { slug: string; hash: string }) =>
  `/blogs/${slug}/?utm_source=share&utm_medium=link&utm_campaign=${hash}`;

const example = published.find((p) => p.slug === "taking-responsibility-for-your-ai-generated-code")!;

test("every post's short link redirects to it with the share UTM tags", async ({ request }) => {
  const wrong: string[] = [];
  for (const post of published) {
    const html = await (await request.get(`/${post.hash}`)).text();
    const refresh = html.match(/<meta http-equiv="refresh" content="([^"]*)"/)?.[1] ?? "";
    // the attribute is HTML-encoded; & arrives as &#38; or &amp;
    const decoded = refresh.replace(/&#38;|&amp;/g, "&");
    if (decoded !== `0;url=${target(post)}`) wrong.push(post.hash);
  }
  expect(wrong).toEqual([]);
});

// Link previewers (iMessage, Signal, Slack) never follow the redirect; they
// read the tags on the short-link page itself, so it must carry the post's.
const PREVIEW_TAGS = [
  "description", "og:title", "og:description", "og:image", "og:url", "og:type",
  "og:site_name", "twitter:card", "twitter:title", "twitter:description", "twitter:image",
];

function previewOf(html: string) {
  const tags: Record<string, string | undefined> = {
    title: html.match(/<title>([^<]*)<\/title>/)?.[1],
  };
  for (const key of PREVIEW_TAGS) {
    tags[key] = html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];
  }
  return tags;
}

test("a short link previews exactly like its post", async ({ request }) => {
  for (const post of published) {
    const short = previewOf(await (await request.get(`/${post.hash}`)).text());
    const full = previewOf(await (await request.get(`/blogs/${post.slug}/`)).text());
    expect(Object.values(full).every(Boolean), `${post.slug} is missing tags`).toBe(true);
    expect(short, post.hash).toEqual(full);
  }
});

test("following a short link lands on the post", async ({ page }) => {
  await page.goto(`/${example.hash}`);
  await page.waitForURL(`**${target(example)}`);
  await expect(page.locator("article h1")).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the short link still lands on the post", async ({ page }) => {
    await page.goto(`/${example.hash}`);
    await page.waitForURL(`**${target(example)}`);
  });
});

test("the redirect page is noindex, canonical to the post, and loads no analytics", async ({ request }) => {
  const html = await (await request.get(`/${example.hash}`)).text();
  expect(html).toMatch(/<meta name="robots" content="noindex"/);
  expect(html).toContain(`<link rel="canonical" href="${SITE}/blogs/${example.slug}/"`);
  expect(html).not.toMatch(/gtag|googletagmanager|G-MCZFYVP6CG/);
});

test("no post hash collides with a top-level route", () => {
  const routes = [...fs.readdirSync("src/pages"), ...fs.readdirSync("public")].map((e) =>
    e.replace(/\..*$/, "")
  );
  expect(published.filter((p) => routes.includes(p.hash))).toEqual([]);
});

test("short links stay out of the sitemap", () => {
  const sitemap = fs.readFileSync("dist/sitemap-0.xml", "utf8");
  const listed = published.filter((p) => sitemap.includes(`<loc>${SITE}/${p.hash}/</loc>`));
  expect(listed).toEqual([]);
});
