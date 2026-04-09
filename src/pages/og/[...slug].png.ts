import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const interBold = readFileSync(
  join(process.cwd(), "src/assets/fonts/Inter-Bold.ttf"),
);
const interRegular = readFileSync(
  join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf"),
);
const playfairBold = readFileSync(
  join(process.cwd(), "src/assets/fonts/PlayfairDisplay-Bold.ttf"),
);

const profilePng = readFileSync(
  join(process.cwd(), "src/assets/Profile.png"),
);
const profileBase64 = `data:image/png;base64,${profilePng.toString("base64")}`;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = Object.values(
    import.meta.glob<{
      frontmatter: { title: string; tags?: string[]; draft?: boolean };
    }>("../blogs/*.md", { eager: true }),
  ).filter((p) => import.meta.env.DEV || !p.frontmatter?.draft);

  return posts.map((post) => {
    const file = (post as any).file as string;
    const slug = file.split("/").pop()!.replace(/\.md$/, "");
    return {
      params: { slug },
      props: {
        title: post.frontmatter.title,
        tags: post.frontmatter.tags || [],
      },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const { title, tags } = props as { title: string; tags: string[] };

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 80px",
          position: "relative",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                maxWidth: "900px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: title.length > 60 ? "50px" : "62px",
                      fontFamily: "Playfair Display",
                      fontWeight: 700,
                      color: "#1a1a1a",
                      textAlign: "center",
                      lineHeight: 1.3,
                    },
                    children: title,
                  },
                },
                tags.length > 0
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          gap: "12px",
                          marginTop: "24px",
                        },
                        children: tags.map((tag: string) => ({
                          type: "div",
                          props: {
                            style: {
                              fontSize: "18px",
                              fontFamily: "Inter",
                              fontWeight: 400,
                              color: "#666",
                              background: "#f0f0f0",
                              padding: "6px 16px",
                              borderRadius: "20px",
                            },
                            children: tag,
                          },
                        })),
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "40px",
                right: "50px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "20px",
                      fontFamily: "Inter",
                      fontWeight: 700,
                      color: "#333",
                    },
                    children: "nathantranquilla.me",
                  },
                },
                {
                  type: "img",
                  props: {
                    src: profileBase64,
                    width: 160,
                    height: 160,
                    style: {
                      borderRadius: "50%",
                      border: "3px solid #e0e0e0",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: interRegular,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
