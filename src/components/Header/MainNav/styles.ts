import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Link } from 'gatsby';

export const MainNav = styled.nav`
  ${tw`flex flex-row`};
`;

export const MainNavItem = styled(Link)`
  ${tw`relative border-b border-transparent ml-4 sm:ml-8`};
  width: max-content;
  color: #2a233d;

  &:hover {
    color: #2a233d;
  }

  &.active {
    border-bottom: 1px solid #75b09c;
  }

  &:before {
    ${tw`absolute w-full h-px left-0 invisible`};
    background-color: #75b09c;
    content: '';
    bottom: -1px;
    transform: scaleX(0);
    transition: 0.2s;
  }

  &:hover:before {
    ${tw`visible`};
    transform: scaleX(1);
  }
`;
