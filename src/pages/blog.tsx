import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Posts from 'components/Posts';

const BlogPage: React.FC<{ location: WindowLocation }> = ({ location }) => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "blog" }, published: { eq: true } } }
        sort: { fields: frontmatter___date, order: DESC }
      ) {
        edges {
          node {
            id
            excerpt(pruneLength: 300)
            frontmatter {
              title
              slug
              date(formatString: "MMM DD, YYYY")
              tags
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Blog" url={location.href} />
      <Posts posts={allMarkdownRemark.edges} />
    </Layout>
  );
};

export default BlogPage;
