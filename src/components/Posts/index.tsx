import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';

import Container from 'components/ui/Container';

import { SectionTitle, ImageSharpFluid } from 'helpers/definitions';

import * as S from './styles';

interface Post {
  node: {
    id: string;
    fields: {
      slug: string;
    };
    frontmatter: {
      title: string;
      description: string;
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
  const { markdownRemark, allMarkdownRemark } = useStaticQuery(graphql`
    query {
      markdownRemark(frontmatter: { category: { eq: "blog section" } }) {
        frontmatter {
          title
          subtitle
        }
      }
      allMarkdownRemark(
        filter: { frontmatter: { category: { eq: "blog" }, published: { eq: true } } }
        sort: { fields: frontmatter___date, order: DESC }
      ) {
        edges {
          node {
            id
            html
            fields {
              slug
            }
            frontmatter {
              title
              description
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

  const sectionTitle: SectionTitle = markdownRemark.frontmatter;
  const posts: Post[] = allMarkdownRemark.edges;

  return (
    <Container section>
      <S.Posts>
        {posts.map((item) => {
          const {
            id,
            fields: { slug },
            frontmatter: { title, cover, description, date, tags }
          } = item.node;

          return (
            <S.Post key={id}>
              <S.Link to={slug}>
                {
                  cover && false &&
                    <S.Image>
                      <Img fluid={cover.childImageSharp.fluid} alt={title} />
                    </S.Image>
                }
                <S.Content>
                  <S.Title>{title}</S.Title>
                  <S.Date>{date}</S.Date>
                  <S.Description>{description}</S.Description>
                </S.Content>
              </S.Link>

              <S.Tags>
                {tags.map((item) => (
                  <S.Tag key={item}>{item}</S.Tag>
                ))}
              </S.Tags>
            </S.Post>
          );
        })}
      </S.Posts>
    </Container>
  );
};

export default Posts;
