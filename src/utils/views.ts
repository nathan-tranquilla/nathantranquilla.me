export type ViewCountPlacement = "top" | "bottom" | "hidden";

// A small count tells a new reader nobody came, so it stays hidden. Once it is
// worth showing it sits at the foot of the post; a large one moves up under
// the title, where it works as a reason to read.
const SHOW_AT = 100;
const PROMOTE_AT = 1000;

/** Where a post shows its view count, if at all. */
export const viewCountPlacement = (count: number): ViewCountPlacement =>
  count >= PROMOTE_AT ? "top" : count >= SHOW_AT ? "bottom" : "hidden";
