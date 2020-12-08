import styled from 'styled-components';
import tw from 'tailwind.macro';

export const Paragraph =  styled.p`
  ${tw`my-4`};
`;

export const UnorderedList = styled.ul`
  ${tw`list-disc my-4 pl-8`};
`;

export const OrderedList = styled.ol`
  ${tw`list-decimal my-4 pl-8`};
`

export const Subtitle = styled.h2`
  text-align: left;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-weight: 900;
  line-height: 1.1;
`;

export const Title = styled.h1`
  ${tw`text-3xl`};
`;
