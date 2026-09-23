import { test, expect } from "@playwright/test";
import { postPaths } from "../helpers/posts";

const NEW_POST = "/blogs/taking-responsibility-for-your-ai-generated-code";

// A page nothing links to is a page crawlers reach last, if at all.
test("the newest post has inbound links from other posts", async ({ request }) => {
  const posts = (await postPaths(request)).filter((p) => !p.startsWith(NEW_POST));

  const linking: string[] = [];
  for (const path of posts) {
    const html = await (await request.get(path)).text();
    const article = html.split("<article")[1]?.split("</article>")[0] ?? "";
    if (article.includes(NEW_POST)) linking.push(path);
  }
  expect(linking.length).toBeGreaterThanOrEqual(2);
});

test("no post links to itself in its own body", async ({ request }) => {
  const selfLinking: string[] = [];
  for (const path of await postPaths(request)) {
    const html = await (await request.get(path)).text();
    const article = html.split("<article")[1]?.split("</article>")[0] ?? "";
    const slug = path.replace(/\/$/, "");
    if (article.includes(`href="${slug}"`)) selfLinking.push(path);
  }
  expect(selfLinking).toEqual([]);
});
