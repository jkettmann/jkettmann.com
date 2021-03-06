import React from 'react';
import { graphql } from 'gatsby';
import Link from 'gatsby-link';
import MDXRenderer from 'gatsby-plugin-mdx/mdx-renderer';
import type { WindowLocation } from '@reach/router';

import Layout from 'components/Layout';
import SEO from 'components/SEO';
import TitleSection from 'components/ui/TitleSection';
import SocialShareSideBar from 'components/SocialShareSideBar';

import * as S from './styles';

interface Post {
  body: React.ReactNode;
  excerpt: string;
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    description: string;
    socialImage?: string;
  };
}

interface Props {
  location: WindowLocation;
  data: {
    mdx: Post;
  };
  pageContext: {
    slug: string;
    next: Post;
    previous: Post;
  };
}

const BlogPost: React.FC<Props> = ({ data, pageContext, location }) => {
  const post = data.mdx;
  const { previous, next } = pageContext;

  return (
    <Layout>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        image={post.frontmatter.socialImage}
        url={location.href}
        largeSocialCard
      />
      <S.Container section notFlex>
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

        <SocialShareSideBar
          url={location.href}
          title={post.frontmatter.title}
        />
      </S.Container>
    </Layout>
  );
};

export default BlogPost;

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      body
      excerpt
      frontmatter {
        title
        date(formatString: "MMM DD, YYYY")
        description
        socialImage
      }
    }
  }
`;
