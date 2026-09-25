import fs from "node:fs";
import path from "node:path";
import type { APIRequestContext } from "@playwright/test";

/**
 * Published post paths, read from the blog index.
 *
 * Not from the sitemap: that is generated at build time only, so anything
 * depending on it passes against `astro preview` and fails against `pnpm dev`,
 * which is what CI runs.
 */
export async function postPaths(request: APIRequestContext): Promise<string[]> {
  const html = await (await request.get("/blogs/")).text();
  const hrefs = html.match(/href="\/blogs\/[a-z0-9-]+\/?"/g) ?? [];
  return [...new Set(hrefs.map((h) => h.replace(/href="|"/g, "")))].map((p) =>
    p.endsWith("/") ? p : `${p}/`
  );
}

export const POSTS_DIR = "src/pages/blogs";

/** A post's frontmatter `hash`, read from its source file. */
export function postHash(file: string): string | undefined {
  const source = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  return frontmatter.match(/^hash:\s*"?([^"\n]*)"?\s*$/m)?.[1];
}
