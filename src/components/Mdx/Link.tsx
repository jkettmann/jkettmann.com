import React from 'react';
import { Link as GatsbyLink } from 'gatsby';

type Link = {
  children: React.ReactNode,
  to: string,
}

const Link = ({ children, to, ...other }: Link) => {
  const internal = /^\/(?!\/)/.test(to);

  if (internal) {
    return (
      <GatsbyLink to={to} {...other}>
        {children}
      </GatsbyLink>
    );
  }

  return (
    <a href={to} {...other}>
      {children}
    </a>
  );
};

export default Link;
