import React from 'react';
import { graphql } from 'gatsby';
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import TitleSection from 'components/ui/TitleSection';

interface Page {
  body: React.ReactNode;
  slug: string;
  frontmatter: {
    title: string;
  };
}

interface Props {
  data: {
    mdx: Page;
  };
  pageContext: {
    slug: string;
  };
}

const Page: React.FC<Props> = ({ data }) => {
  const page = data.mdx;

  return (
    <Layout>
      <SEO title={page.frontmatter.title} />
      <Container section notFlex>
        <TitleSection title={page.frontmatter.title} />
        <MDXRenderer>{page.body}</MDXRenderer>
      </Container>
    </Layout>
  );
};

export default Page;

export const query = graphql`
  query PageBySlug($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title
      }
    }
  }
`;
