import type { APIRoute } from "astro";
import { getPosts } from "../utils/posts";

const SITE = "https://nathantranquilla.me";

// A plain-text map of the site for AI agents, so they get the whole archive
// without crawling every page. Generated from the same frontmatter as /blogs,
// which means drafts are excluded and the order stays newest first.
export const GET: APIRoute = () => {
  const posts = getPosts();

  const body = [
    "# nathantranquilla.me",
    "",
    "> Nathan Tranquilla writes about type safety and AI in software development,",
    "> and the seam where they meet.",
    "",
    "Personal site of Nathan Tranquilla, a software developer in Fredericton, New",
    "Brunswick, with fourteen years in web development. The posts argue two",
    "connected cases: that TypeScript's type system is incomplete and ReScript is",
    "the stronger alternative, and that once AI writes most of the code,",
    "correctness rather than typing speed becomes the bottleneck.",
    "",
    "## Posts",
    "",
    ...posts.map((post) => {
      const url = `${SITE}${post.url}`.replace(/\/$/, "");
      const date = post.frontmatter.date.replace(/\//g, "-");
      const tags = post.frontmatter.tags?.length
        ? ` Topics: ${post.frontmatter.tags.join(", ")}.`
        : "";
      return `- [${post.frontmatter.title}](${url}): Published ${date}.${tags}`;
    }),
    "",
    "## Pages",
    "",
    `- [About](${SITE}/about): Background and contact.`,
    `- [Portfolio](${SITE}/portfolio): Projects, including The Office Lines.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
