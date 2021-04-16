import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import type { WindowLocation } from '@reach/router';
import styled, { css, keyframes } from 'styled-components';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import SelfQualifier from 'components/SelfQualifier';
import useSelfQualifier from 'components/SelfQualifier/useSelfQualifier';
import Posts from 'components/Posts';
import FormatHtml from 'components/utils/FormatHtml';
import { Pain } from 'components/SelfQualifier/types';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`

const FadeIn = styled.div<{ fadeIn: boolean }>`
  ${props => props.fadeIn && css`
    animation: 1s ${fadeIn} ease-out;
  `}
`

const IndexPage: React.FC<{ location: WindowLocation }> = ({ location }) => {
  const data = useStaticQuery(graphql`
    query {
      posts: allMarkdownRemark(
        filter: { frontmatter: { selfQualifierTags: { ne: null }, published: { eq: true } } }
        sort: { fields: frontmatter___selfQualifierSort, order: ASC }
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
              selfQualifierTags
            }
          }
        }
      }
      pains: allMarkdownRemark(
          filter: { frontmatter: { category: { eq: "pain" } } }
          sort: { fields: frontmatter___sort, order: ASC }
        ) {
          edges {
            node {
              html
              frontmatter {
                label
                value
              }
            }
          }
        }
      }
  `);

  const pains:Array<Pain> = data.pains.edges.map(({ node }: { node: any }) => ({
    description: node.html,
    value: node.frontmatter.value,
    label: node.frontmatter.label,
  }));
  const { selectedPain, setPain } = useSelfQualifier(pains);

  const posts = data.posts.edges.filter(({ node }: { node: any }) => {
    if (!selectedPain) {
      return true;
    }
    return node.frontmatter.selfQualifierTags.includes(selectedPain.value);
  });

  return (
    <Layout>
      <SEO pathname={location.pathname} />
      <SelfQualifier
        pains={pains}
        selectedPain={selectedPain}
        setPain={setPain}
      />

      <FadeIn fadeIn={!!selectedPain}>
        <Container>
          <FormatHtml content={selectedPain?.description} />
        </Container>

        <Posts posts={posts} />
      </FadeIn>
    </Layout>
  );
};

export default IndexPage;
