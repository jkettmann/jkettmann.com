import React from 'react';

import Container from 'components/ui/Container';

import * as S from './styles';

const Footer: React.FC = () => (
  <S.Footer>
    <Container>
      <S.Links>
        <S.Link
          href="https://github.com/jkettmann"
          rel="noreferrer noopener"
          target="_blank"
        >
          GitHub
        </S.Link>
        <S.Link
          href="https://twitter.com/j_kettmann"
          rel="noreferrer noopener"
          target="_blank"
        >
          Twitter
        </S.Link>
      </S.Links>
    </Container>
  </S.Footer>
);

export default Footer;
