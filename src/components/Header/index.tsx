import React from 'react';

import MainNav from './MainNav';
import Logo from './Logo';

import * as S from './styles';

interface Props {
  siteTitle: string;
}

const Header: React.FC<Props> = ({ siteTitle }) => (
  <S.Header>
    <S.Wrapper>
      <Logo />
      <MainNav />
    </S.Wrapper>
  </S.Header>
);

Header.defaultProps = {
  siteTitle: ``
};

export default Header;
