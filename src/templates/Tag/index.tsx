import React from 'react';
import { graphql } from 'gatsby';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Posts from 'components/Posts';

interface Props {
  location: WindowLocation;
  data: {
    posts: {
      edges: any;
    };
  };
  pageContext: {
    tag: string;
  }
}

const TagPage: React.FC<Props> = ({ data, pageContext, location }) => {
  return (
    <Layout>
      <SEO title={pageContext.tag} pathname={location.pathname}/>
      <Posts posts={data.posts.edges} />
    </Layout>
  );
};

export default TagPage;

export const query = graphql`
  query PostsByTag($tag: String!) {
    posts: allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "blog" }, published: { eq: true }, tags: { in: [$tag] } } }
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
`;