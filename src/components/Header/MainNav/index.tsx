import React, { useState } from 'react';

import * as S from './styles';

interface MainNavItem {
  title: string;
  slug: string;
}

const mainNavItems: MainNavItem[] = [
  {
    title: 'Blog',
    slug: '/blog/'
  },
  {
    title: 'About',
    slug: '/about/'
  },
  // {
  //   title: 'Courses',
  //   slug: '/courses/'
  // }
];

const MainNav: React.FC = () => {
  return (
    <S.MainNav>
      {mainNavItems.map((item, index) => (
        <S.MainNavItem
          key={`nav-item-${index}`}
          to={item.slug}
          activeClassName="active"
        >
          {item.title}
        </S.MainNavItem>
      ))}
    </S.MainNav>
  );
};

export default MainNav;
