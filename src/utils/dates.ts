// Post dates are written "YYYY/MM/DD" in frontmatter and shown to readers in
// words. Parsed and formatted in UTC so a date never shifts a day with the
// time zone of the machine doing the build.
const parts = (date: string) => date.split("/").map(Number) as [number, number, number];

/** "2026/10/01" -> "October 1, 2026" */
export const formatPostDate = (date: string) => {
  const [y, m, d] = parts(date);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

/** "2026/10/01" -> "2026-10-01", for <time datetime>. */
export const isoPostDate = (date: string) => date.replaceAll("/", "-");
