type Post = {
  url: string;
  frontmatter: {
    title: string;
    author: string;
    date: string; // yyyy-mm-dd
    tags: Array<string>;
  };
};

export const getPosts = () =>
  Object.values(
    import.meta.glob<Post>("../pages/blogs/*.md", { eager: true }),
  ).filter(p => !p.frontmatter.tags.includes("script")).sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime(),
  );

export const getPostIndex = (title: string) => {
  let posts = getPosts();
  return posts.findIndex((post) => post.frontmatter.title === title);
};
