// Cross-document view transitions: a post's title and byline carry the
// same name on the home page, the blog list and the post itself, so each piece
// morphs into place on its own. Keyed on the post's permanent hash, not its
// position in a list, and unique per page (a duplicate name makes the browser
// skip the whole transition).
//
// Because the home page and the blog list show the same posts under the same
// names, going from one to the other morphs every shared post into place: the
// list "grows" upward. That is intended (decided 2026-10-04), not a bug.
export type PostPart = "title" | "byline" | "tags";

export const postTransition = (hash: string, part: PostPart) => `view-transition-name: post-${hash}-${part}`;
