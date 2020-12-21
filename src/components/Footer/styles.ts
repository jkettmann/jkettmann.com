import { Link } from 'gatsby';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import UnstyledContainer from 'components/ui/Container';

export const Footer = styled.footer`
  ${tw`flex border-t border-gray-200`};
  height: 70px;
`;

export const Container = styled(UnstyledContainer)`
  ${tw`items-center justify-between`};
`;

export const IconWrapper = styled.div`
  display: flex;
`;

export const IconLink = styled.a`
  margin: 0 8px;
  text-decoration: none;
  border: none;
`;

export const Icon = styled.img`

`;

export const Placeholder = styled.div`
  visibility: hidden;
`;

export const LegalLink = styled(Link)`
  border: none;
`;
