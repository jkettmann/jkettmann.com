import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from 'components/ui/Container/styles';

export const Header = styled.header`
  ${tw`flex items-center`};
  background-color: #E5F0EC;
  height: 70px;
`;

export const Wrapper = styled(Container)`
  ${tw`items-center p-0`};
`;
