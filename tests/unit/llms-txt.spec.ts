import { test, expect } from "@playwright/test";

// The number of published posts, asserted independently of llms.txt so the
// count below cannot be satisfied by a hardcoded file.
async function publishedPostUrls(request: any): Promise<string[]> {
  const html = await (await request.get("/blogs/")).text();
  const hrefs = html.match(/href="\/blogs\/[a-z0-9-]+\/?"/g) ?? [];
  return [...new Set(hrefs.map((h: string) => h.replace(/href="|"/g, "")))];
}

test.describe("llms.txt", () => {
  test("is served as plain text", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
  });

  test("states what the site is about", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    expect(body).toContain("Nathan Tranquilla");
    expect(body).toMatch(/type safety and AI in software development/i);
  });

  test("lists every published post with an absolute URL", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    const listed = body.match(/https:\/\/nathantranquilla\.me\/blogs\/[a-z0-9-]+/g) ?? [];
    const expected = await publishedPostUrls(request);

    expect(expected.length).toBeGreaterThan(10);
    expect(new Set(listed).size).toBe(expected.length);

    for (const path of expected) {
      expect(body).toContain(`https://nathantranquilla.me${path}`.replace(/\/$/, ""));
    }
  });

  test("gives each post a title and a date", async ({ request }) => {
    const body = await (await request.get("/llms.txt")).text();
    expect(body).toContain("Taking Responsibility for Your AI-Generated Code");
    expect(body).toContain("2026-09-23");
  });
});
