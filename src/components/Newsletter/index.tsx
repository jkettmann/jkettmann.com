import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Container from 'components/ui/Container';
import Button from 'components/ui/Button';
import TitleSection from 'components/ui/TitleSection';
import { SectionTitle } from 'helpers/definitions';

import * as S from './styles';

interface Newsletter extends SectionTitle {
  namePlaceholder: string;
  emailPlaceholder: string;
  submitPlaceholder: string;
}

const Newsletter: React.FC = () => {
  const { markdownRemark } = useStaticQuery(graphql`
    query {
      markdownRemark(frontmatter: { category: { eq: "newsletter section" } }) {
        frontmatter {
          title
          subtitle
          namePlaceholder
          emailPlaceholder
          submitPlaceholder
        }
      }
    }
  `);

  const newsletter: Newsletter = markdownRemark.frontmatter;

  return (
    <S.Newsletter>
      <Container section>
        <TitleSection title={newsletter.title} subtitle={newsletter.subtitle} center />
        <S.Form>
          <S.Input type="text" placeholder={newsletter.namePlaceholder} />
          <S.Input type="email" placeholder={newsletter.emailPlaceholder} />
          <Button primary block>
            {newsletter.submitPlaceholder}
          </Button>
        </S.Form>
      </Container>
    </S.Newsletter>
  );
};

export default Newsletter;
