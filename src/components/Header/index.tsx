import React from 'react';

import MainNav from './MainNav';
import Logo from './Logo';

import * as S from './styles';

const Header: React.FC = () => (
  <S.Header>
    <S.Wrapper>
      <Logo />
      <MainNav />
    </S.Wrapper>
  </S.Header>
);

export default Header;
