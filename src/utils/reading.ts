// Reading time for a post: prose words at an adult's silent reading speed.

/** Words a minute: the average for adults reading non-fiction silently. */
const WORDS_PER_MINUTE = 238;

/**
 * Prose words only: code blocks, HTML, link targets and markdown syntax are
 * not reading, and counting them would overstate a post.
 */
export const proseWordCount = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "] ")
    .replace(/[#>*_`\[\]()|-]/g, " ")
    .split(/\s+/)
    .filter((w) => /[a-zA-Z0-9]/.test(w)).length;

/** Minutes to read, rounded up, never under one. */
export const readingMinutes = (words: number) => Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
