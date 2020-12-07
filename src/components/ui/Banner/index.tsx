import React from 'react';
import { Link } from 'gatsby';

import Container from 'components/ui/Container';
import Button from 'components/ui/Button';
import TitleSection from 'components/ui/TitleSection';

import * as S from './styles';

interface Props {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  linkTo: string;
  linkText: string;
}

const Banner: React.FC<Props> = ({ title, subtitle, content, linkTo, linkText }) => (
  <S.Banner>
    <Container section>
      <TitleSection title={title} subtitle={subtitle} />
      <S.Content>{content}</S.Content>
      <Link to={linkTo}>
        <Button primary>{linkText}</Button>
      </Link>
    </Container>
  </S.Banner>
);

export default Banner;
