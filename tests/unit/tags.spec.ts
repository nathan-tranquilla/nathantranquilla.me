import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { POSTS_DIR } from "../helpers/posts";
import { TAGS } from "../../src/utils/tags";

// Tags group related posts. A small approved list keeps them meaningful:
// every post carries one to three tags, all from that list.
const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const src = fs.readFileSync(`${POSTS_DIR}/${f}`, "utf8");
    const line = src.match(/^tags:\s*(\[.*\])\s*$/m)?.[1] ?? "[]";
    return { file: f, tags: JSON.parse(line) as string[] };
  });

test("every post has one to three tags", () => {
  const bad = posts.filter((p) => p.tags.length < 1 || p.tags.length > 3).map((p) => `${p.file}: ${p.tags.length}`);
  expect(bad).toEqual([]);
});

test("every tag comes from the approved list", () => {
  const allowed = new Set<string>(TAGS);
  const bad = posts.flatMap((p) => p.tags.filter((t) => !allowed.has(t)).map((t) => `${p.file}: ${t}`));
  expect(bad).toEqual([]);
});

test("no post repeats a tag", () => {
  const bad = posts.filter((p) => new Set(p.tags).size !== p.tags.length).map((p) => p.file);
  expect(bad).toEqual([]);
});

test("every approved tag is in use", () => {
  const used = new Set(posts.flatMap((p) => p.tags));
  expect(TAGS.filter((t) => !used.has(t))).toEqual([]);
});
