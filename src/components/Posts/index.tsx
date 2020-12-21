import React from 'react';
import Img from 'gatsby-image';

import Container from 'components/ui/Container';

import { ImageSharpFluid } from 'helpers/definitions';

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
    };
  };
}

type PostsProps = {
  posts: [Post];
}

const Posts: React.FC<PostsProps> = ({ posts }) => {
  return (
    <Container section>
      <S.Posts>
        {posts.map((item) => {
          const {
            id,
            excerpt,
            frontmatter: { title, slug, date, tags }
          } = item.node;

          return (
            <S.Post key={id}>
              <S.Link to={`/${slug}`}>
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
                      <S.Tag key={item} to={`/tag/${item.toLowerCase()}`}>{item}</S.Tag>
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
