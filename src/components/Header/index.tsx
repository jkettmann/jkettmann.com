import React from 'react';

import MainNav from './MainNav';
import Logo from './Logo';
import TwitterIcon from 'components/Icons/twitter.svg';

import * as S from './styles';

const Header: React.FC = () => (
  <S.Header>
    <S.Wrapper>
      <Logo />
      <MainNav />
      <S.IconLink
        href="https://twitter.com/j_kettmann"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter profile Johannes Kettmann"
      >
        <S.Icon src={TwitterIcon} alt="Twitter icon" />
      </S.IconLink>
    </S.Wrapper>
  </S.Header>
);

export default Header;
