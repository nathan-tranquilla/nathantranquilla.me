type Post = {
  url: string;
  frontmatter: {
    title: string;
    author: string;
    date: string; // yyyy-mm-dd
    tags: Array<string>;
    draft?: boolean;
  };
};

export const getPosts = () =>
  Object.values(import.meta.glob<Post>("../pages/blogs/*.md", { eager: true }))
    .filter((p) => import.meta.env.DEV || !p.frontmatter?.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );

export const getPostIndex = (title: string) => {
  let posts = getPosts();
  return posts.findIndex((post) => post.frontmatter.title === title);
};
