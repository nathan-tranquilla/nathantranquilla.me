// Cross-document view transitions: a post's title and byline carry the
// same name on the home page, the blog list and the post itself, so each piece
// morphs into place on its own. Keyed on the post's permanent hash, not its
// position in a list, and unique per page (a duplicate name makes the browser
// skip the whole transition).
export type PostPart = "title" | "byline";

export const postTransition = (hash: string, part: PostPart) => `view-transition-name: post-${hash}-${part}`;
