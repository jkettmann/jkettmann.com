import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import type { WindowLocation } from '@reach/router';
import styled from 'styled-components';
import tw from 'tailwind.macro';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Posts from 'components/Posts';

const AboutMe = styled.div`
  ${tw`max-w-xl my-16 p-8 mx-auto text-center`};
`;

const Headline = styled.div`
  ${tw`text-3xl font-bold`};
`;

const Subline = styled.div`
  ${tw`mt-2 mb-4`};
`;

const Profy = styled.div`
  ${tw`text-sm`};
`;

const PopularArticles = styled.div`
  margin-top: 70px;
  margin-bottom: -70px; 
`;

const Title = styled.div`
  ${tw`text-3xl text-center mt-0 mb-0 px-6`};
`

const IndexPage: React.FC<{ location: WindowLocation }> = ({ location }) => {
  const data = useStaticQuery(graphql`
    query {
      posts: allMarkdownRemark(
        filter: { frontmatter: { popular: { ne: null }, published: { eq: true } } }
        sort: { fields: frontmatter___popular, order: DESC }
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
      <SEO pathname={location.pathname} />
      <AboutMe>
        <Headline>Hi, I'm Johannes.</Headline>
        <Subline>I write about React, professional dev skills, and career advice.</Subline>
        <Profy>I'm also the creator of <a href="https://profy.dev">Profy.dev</a>, where React developers can build a project for their portfolio using professional workflows.</Profy>
      </AboutMe>

      <PopularArticles>
        <Title>Popular Articles</Title>
        <Posts posts={data.posts.edges} />
      </PopularArticles>
    </Layout>
  );
};

export default IndexPage;
