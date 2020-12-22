import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from 'components/ui/Container/styles';

export const Header = styled.header`
  ${tw`flex items-center`};
  background-color: #E5F0EC;
  height: 70px;
  font-size: 18px
`;

export const Wrapper = styled(Container)`
  ${tw`items-center px-2`};
`;

export const IconLink = styled.a`
  margin: 0 8px;
  text-decoration: none;
  border: none;
`;

export const Icon = styled.img`
  width: 20px;
`;
