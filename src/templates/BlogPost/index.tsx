import React from 'react';
import { graphql } from 'gatsby';
import Link from 'gatsby-link';
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import Container from 'components/ui/Container';
import TitleSection from 'components/ui/TitleSection';

import * as S from './styles';

interface Post {
  body: React.ReactNode;
  slug: string;
  frontmatter: {
    title: string;
    date: string;
  };
}

interface Props {
  data: {
    mdx: Post;
  };
  pageContext: {
    slug: string;
    next: Post;
    previous: Post;
  };
}

const BlogPost: React.FC<Props> = ({ data, pageContext }) => {
  const post = data.mdx;
  const { previous, next } = pageContext;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <Container section>
        <TitleSection date={post.frontmatter.date} title={post.frontmatter.title} />
        <MDXRenderer>{post.body}</MDXRenderer>
        <S.Links>
          <span>
            {previous && (
              <Link to={`/${previous.slug}`} rel="previous">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </span>
          <span>
            {next && (
              <Link to={`/${next.slug}`} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </span>
        </S.Links>
      </Container>
    </Layout>
  );
};

export default BlogPost;

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title
        date(formatString: "MMM DD, YYYY")
      }
    }
  }
`;
