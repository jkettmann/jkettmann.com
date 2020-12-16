import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import SelfQualifier from 'components/SelfQualifier';
import Posts from 'components/Posts';

const IndexPage: React.FC = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { frontmatter: { selfQualifierTag: { ne: null }, published: { eq: true } } }
        sort: { fields: frontmatter___selfQualifierSort, order: ASC }
      ) {
        edges {
          node {
            id
            html
            excerpt(pruneLength: 300)
            frontmatter {
              title
              slug
              date(formatString: "MMM DD, YYYY")
              tags
              selfQualifierTag
              cover {
                childImageSharp {
                  fluid(maxWidth: 800) {
                    ...GatsbyImageSharpFluid
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="About Me" />
      <SelfQualifier />
      <Container>
        <p>
          You're looking to level-up your skills so you can finally find that first job and break into the industry. But so many of the resources out there serve beginners.
        </p>
      </Container>

      <Posts posts={allMarkdownRemark.edges} />
    </Layout>
  );
};

export default IndexPage;
