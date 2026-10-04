// The approved post tags. A tag earns its place by grouping related posts;
// adding one is a deliberate change here, and tags.spec.ts holds every post
// to this list (one to three tags each).
export const TAGS = ["AI", "Coding", "Automation", "Type Safety", "ReScript", "Finance"] as const;

export type TagName = (typeof TAGS)[number];

/** How many posts carry each approved tag, in TAGS order. */
export const tagCounts = (posts: { frontmatter: { tags: string[] } }[]) =>
  Object.fromEntries(TAGS.map((t) => [t, posts.filter((p) => p.frontmatter.tags.includes(t)).length])) as Record<
    TagName,
    number
  >;
