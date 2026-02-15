// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://nathantranquilla.me',
  integrations: [react(), sitemap()],

  build: {
    inlineStylesheets: "always",
  },

  markdown: {
    shikiConfig: {
      theme: 'houston',
    }
  }
});