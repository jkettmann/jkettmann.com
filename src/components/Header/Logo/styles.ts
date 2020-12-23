import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Link } from 'gatsby';

export const Logo = styled(Link)`
  ${tw`flex items-center mr-auto`};
  color: #2a233d;
  border: none;

  :hover {
    color: #2a233d;
  }
`;

export const Text = styled.div`
  @media (max-width: 530px) {
    display: none;
  }
`;

export const Image = styled.figure`
  ${tw`w-12 h-12 mr-2 border rounded-full`};
  border-color: #75b09c;

  img {
    ${tw`border-4 border-white rounded-full`};
  }
`;
