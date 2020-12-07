import React from 'react';

import Container from 'components/ui/Container';

import * as S from './styles';

const Footer: React.FC = () => (
  <S.Footer>
    <Container>
      <S.Links>
        <S.Link href="/" rel="noreferrer noopener" target="_blank">
          GitHub
        </S.Link>
        <S.Link
          href="https://github.com/SaimirKapaj/gatsby-markdown-typescript-personal-website"
          rel="noreferrer noopener"
          target="_blank"
        >
          Twitter
        </S.Link>
        <S.Link href="/" rel="noreferrer noopener" target="_blank">
          Behance
        </S.Link>
      </S.Links>
    </Container>
  </S.Footer>
);

export default Footer;
