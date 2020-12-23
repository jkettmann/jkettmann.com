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
              tags
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
      courses: allMdx(filter: { frontmatter: { category: { eq: "course" }, slug: { ne: null } } }) {
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

  const tags = posts.edges.reduce((tmpTags, { node }) => {
    return tmpTags.concat(node.frontmatter.tags || []);
  }, []);
  const uniqueTags = Array.from(new Set(tags));
  const tagTemplate = path.resolve(`src/templates/Tag/index.tsx`);
  uniqueTags.forEach((tag) => {
    createPage({
      path: `/tag/${tag.toLowerCase()}`,
      component: tagTemplate,
      context: {
        tag,
      }
    });
  });

  const courseTemplate = path.resolve(`src/templates/Course/index.tsx`);
  courses.edges.forEach((course) => {
    createPage({
      path: `/${course.node.frontmatter.slug}`,
      component: courseTemplate,
      context: {
        slug: `${course.node.frontmatter.slug}`,
      }
    });
  });

  const pageTemplate = path.resolve(`src/templates/Page/index.tsx`);
  pages.edges.forEach((page) => {
    createPage({
      path: `/${page.node.frontmatter.slug}`,
      component: pageTemplate,
      context: {
        slug: `${page.node.frontmatter.slug}`,
      }
    });
  });
};
