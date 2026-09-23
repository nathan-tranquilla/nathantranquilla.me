import { test, expect } from "@playwright/test";

const POST = "/blogs/taking-responsibility-for-your-ai-generated-code/";

async function articleSchema(request: any, path: string) {
  const html = await (await request.get(path)).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  for (const b of blocks) {
    const d = JSON.parse(b[1]);
    if (d["@type"] === "Article") return d;
  }
  return null;
}

test("Article schema classifies the post for machines", async ({ request }) => {
  const a = await articleSchema(request, POST);
  expect(a).not.toBeNull();

  expect(a.inLanguage).toBe("en-US");
  // articleSection is the primary topic, which is the post's first tag
  expect(a.articleSection).toBe("AI");
  // a real count, not a placeholder
  expect(typeof a.wordCount).toBe("number");
  expect(a.wordCount).toBeGreaterThan(1500);
  expect(a.wordCount).toBeLessThan(4000);
});

test("wordCount is derived per post, not hardcoded", async ({ request }) => {
  const a = await articleSchema(request, POST);
  const b = await articleSchema(request, "/blogs/coding-is-not-for-humans/");
  expect(a.wordCount).not.toBe(b.wordCount);
  expect(a.articleSection).not.toBe(undefined);
});
