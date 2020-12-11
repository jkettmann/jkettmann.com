import React from 'react';
import { Link as GatsbyLink } from 'gatsby';

export type LinkProps = {
  children: React.ReactNode,
  to: string,
}

const Link = ({ children, to, ...other }: LinkProps) => {
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
