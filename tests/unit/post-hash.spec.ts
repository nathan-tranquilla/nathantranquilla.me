import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { postHash, POSTS_DIR } from "../helpers/posts";

// The hash is the post's permanent share ID: GA4 share events key on it now,
// and short links will later be built from it. It is stored, never derived,
// so renaming a post or its title cannot change it.
const posts = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

test("every post has a six-character lowercase hash", () => {
  const missing = posts.filter((f) => !/^[a-z0-9]{6}$/.test(postHash(f) ?? ""));
  expect(missing).toEqual([]);
});

test("no two posts share a hash", () => {
  const hashes = posts.map(postHash);
  expect(new Set(hashes).size).toBe(posts.length);
});
