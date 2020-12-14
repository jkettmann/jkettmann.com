import React from 'react';

import * as S from './styles';

const Footer: React.FC = () => (
  <S.Footer>
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
  </S.Footer>
);

export default Footer;
