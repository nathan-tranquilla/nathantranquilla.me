// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import fs from "node:fs";
import path from "node:path";

// Post publish dates, read straight off the markdown, so the sitemap can tell
// crawlers what changed. Only posts get a lastmod: a made-up timestamp on a
// static page is worse than none, because Google discounts sitemaps whose
// lastmod it finds unreliable.
const POSTS_DIR = "src/pages/blogs";
const postDates = Object.fromEntries(
  fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const src = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const date = src.match(/^date:\s*"?(\d{4})\/(\d{2})\/(\d{2})"?/m);
      const updated = src.match(/^updated:\s*"?(\d{4})\/(\d{2})\/(\d{2})"?/m);
      const d = updated ?? date;
      return [f.replace(/\.md$/, ""), d ? `${d[1]}-${d[2]}-${d[3]}` : null];
    })
    .filter(([, d]) => d)
);

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://nathantranquilla.me',
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const slug = item.url.match(/\/blogs\/([a-z0-9-]+)\/?$/)?.[1];
        const date = slug && postDates[slug];
        if (date) item.lastmod = new Date(`${date}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],

  build: {
    inlineStylesheets: "always",
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'houston',
      },
    }
  }
});