import styled from 'styled-components';
import tw from 'tailwind.macro';

export const Footer = styled.footer`
  ${tw`flex items-center justify-center w-full border-t border-gray-200`};
  height: 70px;
`;

export const Link = styled.a`
  ${tw`mx-2`};
  color: #2a233d;
  border: none;
`;
