import React, { useState } from 'react';

import * as S from './styles';

interface MainNavItem {
  title: string;
  slug: string;
}

const mainNavItems: MainNavItem[] = [
  {
    title: 'About Me',
    slug: '/'
  },
  {
    title: 'Resume',
    slug: '/resume/'
  },
  {
    title: 'Blog',
    slug: '/blog/'
  },
  {
    title: 'Contact Me',
    slug: '/contact/'
  }
];

const MainNav: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <S.MainNav open={open}>
        {mainNavItems.map((item, index) => (
          <S.MainNavItem
            key={`nav-item-${index}`}
            to={item.slug}
            activeClassName="active"
            whileTap={{ scale: 0.9 }}
          >
            {item.title}
          </S.MainNavItem>
        ))}
      </S.MainNav>
      <S.ToogleMainNav open={open} onClick={() => setOpen(!open)}>
        <span />
        <span />
        <span />
      </S.ToogleMainNav>
    </>
  );
};

export default MainNav;
