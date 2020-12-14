import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';

import Container from 'components/ui/Container';

import { SectionTitle, ImageSharpFluid } from 'helpers/definitions';

import * as S from './styles';

interface Post {
  node: {
    id: string;
    excerpt: string;
    frontmatter: {
      title: string;
      slug: string;
      date: string;
      tags: string[];
      cover: {
        childImageSharp: {
          fluid: ImageSharpFluid;
        };
      };
    };
  };
}

const Posts: React.FC = () => {
  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "blog" }, published: { eq: true } } }
        sort: { fields: frontmatter___date, order: DESC }
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

  const posts: Post[] = allMarkdownRemark.edges;

  return (
    <Container section>
      <S.Posts>
        {posts.map((item) => {
          const {
            id,
            excerpt,
            frontmatter: { title, slug, cover, date, tags }
          } = item.node;

          return (
            <S.Post key={id}>
              <S.Link to={`/${slug}`}>
                {
                  cover && false &&
                    <S.Image>
                      <Img fluid={cover.childImageSharp.fluid} alt={title} />
                    </S.Image>
                }
                <S.Content>
                  <S.Title>{title}</S.Title>
                  <S.Date>{date}</S.Date>
                  <S.Description>{excerpt}</S.Description>
                </S.Content>
              </S.Link>

              {
                tags?.length && (
                  <S.Tags>
                    {tags.map((item) => (
                      <S.Tag key={item}>{item}</S.Tag>
                    ))}
                  </S.Tags>
                )
              }
            </S.Post>
          );
        })}
      </S.Posts>
    </Container>
  );
};

export default Posts;
