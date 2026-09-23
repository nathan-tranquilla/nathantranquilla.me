import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts } from "../utils/posts";

const SITE = "https://nathantranquilla.me";

// Generated from the same getPosts() as /blogs and /llms.txt, so drafts stay
// out and the ordering stays newest first.
export const GET: APIRoute = (context) =>
  rss({
    title: "nathantranquilla.me",
    description:
      "Type safety and AI in software development, and the seam where they meet.",
    site: context.site?.toString() ?? SITE,
    items: getPosts().map((post) => ({
      title: post.frontmatter.title,
      link: `${SITE}${post.url}/`.replace(/\/\/$/, "/"),
      pubDate: new Date(post.frontmatter.date),
      description: post.frontmatter.description ?? post.frontmatter.title,
      categories: post.frontmatter.tags,
      author: post.frontmatter.author,
    })),
    customData: "<language>en-us</language>",
  });
