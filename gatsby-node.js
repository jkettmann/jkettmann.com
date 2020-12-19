const path = require(`path`);

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, `src`), `node_modules`]
    }
  });
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const res = await graphql(`
    query {
      posts: allMdx(filter: { frontmatter: { category: { eq: "blog" } } }, sort: { fields: frontmatter___date, order: DESC }) {
        edges {
          node {
            id
            frontmatter {
              slug
              title
            }
          }
        }
      }
      pages: allMdx(filter: { frontmatter: { category: { eq: "page" } } }) {
        edges {
          node {
            id
            frontmatter {
              slug
              title
            }
          }
        }
      }
      courses: allMdx(filter: { frontmatter: { category: { eq: "course" } } }) {
        edges {
          node {
            id
            frontmatter {
              slug
              title
            }
          }
        }
      }
    }
  `);

  const { posts, pages, courses } = res.data;

  const blogPostTemplate = path.resolve(`src/templates/BlogPost/index.tsx`);
  posts.edges.forEach((post, index) => {
    const previous = index === posts.edges.length - 1 ? null : posts.edges[index + 1].node;
    const next = index === 0 ? null : posts.edges[index - 1].node;

    createPage({
      path: `/${post.node.frontmatter.slug}`,
      component: blogPostTemplate,
      context: {
        slug: `${post.node.frontmatter.slug}`,
        previous,
        next
      }
    });
  });

  const pageTemplate = path.resolve(`src/templates/Page/index.tsx`);
  pages.edges.concat(courses.edges).forEach((page) => {
    createPage({
      path: `/${page.node.frontmatter.slug}`,
      component: pageTemplate,
      context: {
        slug: `${page.node.frontmatter.slug}`,
      }
    });
  });
};
