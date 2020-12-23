import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Courses from 'components/Courses';

const BlogPage: React.FC<{ location: WindowLocation }> = ({ location }) => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "course" }, published: { eq: true } } }
        sort: { fields: frontmatter___sort, order: ASC }
      ) {
        edges {
          node {
            id
            excerpt(pruneLength: 300)
            frontmatter {
              title
              slug
              url
              tags
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Courses" url={location.href} />
      <Courses courses={allMarkdownRemark.edges} />
    </Layout>
  );
};

export default BlogPage;
