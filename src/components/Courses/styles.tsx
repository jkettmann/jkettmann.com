import styled from 'styled-components';
import tw from 'tailwind.macro';
import UnstyledLink from 'gatsby-link';

export const Courses = styled.div`
  ${tw`w-full flex flex-wrap`};
`;

export const Course = styled.div`
  ${tw`w-full mt-12`};

  :first-child {
    margin-top: 0;
  }
`;

export const Link = styled(UnstyledLink)`
  ${tw`flex flex-col`};
  color: #2a233d;
  border: none;

  :hover {
    color: #2a233d;
  }
`;

export const Content = styled.div`
  ${tw`p-4`};
`;

export const Image = styled.figure`
  ${tw`w-full`};
`;

export const Title = styled.h2`
  ${tw`mt-0 mb-0`};
`;

export const Date = styled.div`
  ${tw`text-xs mb-4`};
`;

export const Description = styled.p``;

export const Tags = styled.div`
  ${tw`flex flex-wrap p-4 pt-2 mt-auto`};
`;

export const Tag = styled.div`
  ${tw`text-xs break-all rounded-full border px-2 py-1 mr-2 mb-2`};
  border-color: #75b09c;
`;
