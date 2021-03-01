import React from 'react';

import Container from 'components/ui/Container';
import * as S from './styles';

interface Course {
  node: {
    id: string;
    excerpt: string;
    frontmatter: {
      title: string;
      slug?: string;
      url?: string;
      tags?: Array<string>;
    };
  };
}

type CoursesProps = {
  courses: [Course];
}

const Courses: React.FC<CoursesProps> = ({ courses }) => {
  return (
    <Container section>
      <S.Courses>
        {courses.map((item) => {
          const {
            id,
            excerpt,
            frontmatter: { title, slug, url, tags }
          } = item.node;

          return (
            <S.Course key={id}>
              <S.Link
                to={slug && `/${slug}`}
                href={url}
                as={url && 'a'}
              >
                <S.Content>
                  <S.Title>{title}</S.Title>
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
            </S.Course>
          );
        })}
      </S.Courses>
    </Container>
  );
};

export default Courses;
