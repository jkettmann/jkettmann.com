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
  // {
  //   title: 'Courses',
  //   slug: '/courses/'
  // }
];

const MainNav: React.FC = () => {
  return (
    <S.MainNav open={open}>
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
