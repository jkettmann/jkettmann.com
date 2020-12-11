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
  ${tw`text-base`};
`;

export const Image = styled.figure`
  ${tw`w-12 h-12 mr-2 border border-teal-400 rounded-full`};

  img {
    ${tw`border-4 border-white rounded-full`};
  }
`;
